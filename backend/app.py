
import os
from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
import jwt
from datetime import datetime, timedelta
from functools import wraps
from werkzeug.security import generate_password_hash, check_password_hash
from scipy.optimize import linprog
import json

# App Initialization
app = Flask(__name__)
CORS(app)

# Config
app.config['SECRET_KEY'] = 'your_super_secret_key'
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///mess.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

# --- Database Models ---
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)
    password_hash = db.Column(db.String(200), nullable=False)
    role = db.Column(db.String(20), nullable=False) # 'student', 'admin', 'staff'

class Meal(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), unique=True, nullable=False) # Breakfast, Lunch, etc.
    voting_closes_hour = db.Column(db.Integer, nullable=False)

class Vote(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    meal_id = db.Column(db.Integer, db.ForeignKey('meal.id'), nullable=False)
    vote = db.Column(db.Boolean, nullable=False) # True for YES, False for NO
    date = db.Column(db.Date, nullable=False, default=datetime.utcnow().date)
    user = db.relationship('User', backref=db.backref('votes', lazy=True))
    meal = db.relationship('Meal', backref=db.backref('votes', lazy=True))

class MealPlan(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    date = db.Column(db.Date, nullable=False, default=datetime.utcnow().date)
    meal_name = db.Column(db.String(50), nullable=False)
    plan_details = db.Column(db.Text, nullable=False) # JSON string
    total_cost = db.Column(db.Float, nullable=False)

# --- JWT Token Decorator ---
def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        if 'x-access-token' in request.headers:
            token = request.headers['x-access-token']
        if not token:
            return jsonify({'message': 'Token is missing!'}), 401
        try:
            data = jwt.decode(token, app.config['SECRET_KEY'], algorithms=["HS256"])
            current_user = User.query.get(data['id'])
        except:
            return jsonify({'message': 'Token is invalid!'}), 401
        return f(current_user, *args, **kwargs)
    return decorated

# --- Helper function to create initial data ---
def create_initial_data():
    with app.app_context():
        db.create_all()
        if Meal.query.count() == 0:
            meals = [
                Meal(name='Breakfast', voting_closes_hour=4), # Closes at 4 AM
                Meal(name='Lunch', voting_closes_hour=8),     # Closes at 8 AM
                Meal(name='Snacks', voting_closes_hour=13),    # Closes at 1 PM
                Meal(name='Dinner', voting_closes_hour=17)     # Closes at 5 PM
            ]
            db.session.bulk_save_objects(meals)
            db.session.commit()
        print("Database initialized and meals created.")


# --- API Endpoints ---
@app.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    hashed_password = generate_password_hash(data['password'], method='sha256')
    new_user = User(
        name=data['name'],
        email=data['email'],
        password_hash=hashed_password,
        role=data['role']
    )
    db.session.add(new_user)
    db.session.commit()
    return jsonify({'message': 'New user registered!'})

@app.route('/login', methods=['POST'])
def login():
    auth = request.authorization
    if not auth or not auth.username or not auth.password:
        return jsonify({'message': 'Could not verify'}), 401

    user = User.query.filter_by(email=auth.username).first()
    if not user:
        return jsonify({'message': 'User not found'}), 401

    if check_password_hash(user.password_hash, auth.password):
        token = jwt.encode({
            'id': user.id,
            'role': user.role,
            'exp': datetime.utcnow() + timedelta(hours=24)
        }, app.config['SECRET_KEY'], algorithm="HS256")
        return jsonify({'token': token, 'role': user.role, 'name': user.name})

    return jsonify({'message': 'Could not verify'}), 401

@app.route('/cast_vote', methods=['POST'])
@token_required
def cast_vote(current_user):
    if current_user.role != 'student':
        return jsonify({'message': 'Only students can vote'}), 403

    data = request.get_json()
    meal_name = data['meal_name']
    vote_cast = data['vote'] # True for YES, False for NO

    meal = Meal.query.filter_by(name=meal_name).first()
    if not meal:
        return jsonify({'message': 'Meal not found'}), 404

    # Check if voting is closed
    now = datetime.utcnow()
    if now.hour >= meal.voting_closes_hour:
        return jsonify({'message': f'Voting for {meal_name} is closed'}), 403

    # Check for existing vote for today
    today = now.date()
    existing_vote = Vote.query.filter_by(user_id=current_user.id, meal_id=meal.id, date=today).first()

    if existing_vote:
        existing_vote.vote = vote_cast
        db.session.commit()
        return jsonify({'message': 'Your vote has been updated.'})
    else:
        new_vote = Vote(user_id=current_user.id, meal_id=meal.id, vote=vote_cast, date=today)
        db.session.add(new_vote)
        db.session.commit()
        return jsonify({'message': 'Your vote has been cast.'})


@app.route('/get_vote_data', methods=['GET'])
@token_required
def get_vote_data(current_user):
    if current_user.role not in ['admin', 'student']:
        return jsonify({'message': 'Cannot perform this function'}), 403

    response = {}
    meals = Meal.query.all()
    today = datetime.utcnow().date()
    now_hour = datetime.utcnow().hour

    for meal in meals:
        yes_count = Vote.query.filter_by(meal_id=meal.id, vote=True, date=today).count()
        no_count = Vote.query.filter_by(meal_id=meal.id, vote=False, date=today).count()
        
        user_vote = None
        if current_user.role == 'student':
            vote_obj = Vote.query.filter_by(user_id=current_user.id, meal_id=meal.id, date=today).first()
            if vote_obj is not None:
                user_vote = 'YES' if vote_obj.vote else 'NO'

        response[meal.name] = {
            'yes': yes_count,
            'no': no_count,
            'status': 'CLOSED' if now_hour >= meal.voting_closes_hour else 'LIVE',
            'user_vote': user_vote
        }
    return jsonify(response)

@app.route('/get_yes_students/<meal_name>', methods=['GET'])
@token_required
def get_yes_students(current_user, meal_name):
    if current_user.role != 'admin':
        return jsonify({'message': 'Cannot perform this function'}), 403

    meal = Meal.query.filter_by(name=meal_name).first()
    if not meal:
        return jsonify({'message': 'Meal not found'}), 404

    today = datetime.utcnow().date()
    yes_votes = Vote.query.filter_by(meal_id=meal.id, vote=True, date=today).all()

    students = []
    for vote in yes_votes:
        students.append({'name': vote.user.name, 'email': vote.user.email})

    return jsonify(students)

@app.route('/generate_cost_plan', methods=['POST'])
@token_required
def generate_cost_plan(current_user):
    if current_user.role != 'admin':
        return jsonify({'message': 'Cannot perform this function'}), 403

    data = request.get_json()
    meal_name = data['meal_name']
    
    # --- Simplified LPP Model ---
    # This is a placeholder model. A real-world scenario would be much more complex.
    # Objective: Minimize cost = C.X
    # Constraints: A_ub.X <= b_ub (e.g., nutrition constraints, max ingredient limits)
    
    today = datetime.utcnow().date()
    num_students = Vote.query.filter_by(meal_id=Meal.query.filter_by(name=meal_name).first().id, vote=True, date=today).count()

    if num_students == 0:
        return jsonify({'message': 'No students to plan for!'})

    # Ingredients and their costs (from admin input)
    # Format: { "rice": 50, "dal": 100, ... }
    costs = data['costs']
    ingredients = list(costs.keys())
    c = [costs[i] for i in ingredients]

    # Constraints: Let's assume some basic per-student requirements
    # e.g., each student needs at least 0.15kg of rice, 0.1kg of dal, etc.
    # This creates inequality constraints like: -rice <= -0.15 * num_students
    # We'll create a simple matrix for this.
    
    # Per-student minimums (in kg or liters)
    min_reqs = {
        'rice': 0.15, 'dal': 0.1, 'vegetables': 0.2, 
        'flour': 0.1, 'sugar': 0.05, 'milk': 0.25
    }
    
    # Ensure all ingredients in costs are in min_reqs for this simple model
    for ing in ingredients:
        if ing not in min_reqs:
            return jsonify({'message': f'Ingredient "{ing}" not in requirement model.'}), 400

    num_ingredients = len(ingredients)
    A_ub = -1 *  _np.identity(num_ingredients)
    b_ub = [-min_reqs[ing] * num_students for ing in ingredients]

    # Bounds for each ingredient (e.g., non-negative)
    bounds = [(0, None) for _ in range(num_ingredients)]

    # Solve the LPP
    result = linprog(c, A_ub=A_ub, b_ub=b_ub, bounds=bounds, method='highs')

    if not result.success:
        return jsonify({'message': 'Could not calculate an optimized plan. Check constraints.'}), 500

    # Format the output
    plan = {ingredients[i]: round(result.x[i], 2) for i in range(num_ingredients)}
    total_cost = round(result.fun, 2)

    # Save the plan to the database
    new_plan = MealPlan(
        meal_name=meal_name,
        plan_details=json.dumps(plan),
        total_cost=total_cost,
        date=today
    )
    # Overwrite if exists for the same day and meal
    existing_plan = MealPlan.query.filter_by(date=today, meal_name=meal_name).first()
    if existing_plan:
        db.session.delete(existing_plan)
        db.session.commit()
        
    db.session.add(new_plan)
    db.session.commit()

    return jsonify({'plan': plan, 'total_cost': total_cost})


@app.route('/send_to_staff', methods=['POST'])
@token_required
def send_to_staff(current_user):
    if current_user.role != 'admin':
        return jsonify({'message': 'Cannot perform this function'}), 403
    # In a real app, this would trigger a notification (email, SMS, etc.)
    # For this project, we just confirm that the latest plan is available for staff to view.
    data = request.get_json()
    meal_name = data['meal_name']
    today = datetime.utcnow().date()
    
    plan = MealPlan.query.filter_by(date=today, meal_name=meal_name).order_by(MealPlan.id.desc()).first()
    
    if not plan:
        return jsonify({'message': f'No plan generated for {meal_name} today. Please generate one first.'}), 404
        
    return jsonify({'message': f'Plan for {meal_name} has been sent to staff.'})


@app.route('/get_staff_plan', methods=['GET'])
@token_required
def get_staff_plan(current_user):
    if current_user.role != 'staff':
        return jsonify({'message': 'Cannot perform this function'}), 403
    
    today = datetime.utcnow().date()
    plans = MealPlan.query.filter_by(date=today).all()
    
    if not plans:
        return jsonify({'message': 'No meal plans available for today.'})
        
    response = {}
    for plan in plans:
        response[plan.meal_name] = {
            'quantities': json.loads(plan.plan_details),
            'total_cost': plan.total_cost
        }
        
    return jsonify(response)


if __name__ == '__main__':
    # Create the database and initial data if it doesn't exist
    if not os.path.exists('instance/mess.db'):
        create_initial_data()
    app.run(debug=True, port=5000)

