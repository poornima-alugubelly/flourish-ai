import ollama
import time
from fastapi import FastAPI, Depends, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Union, Optional
from datetime import datetime, date
from sqlalchemy.orm import Session
from database import (
    get_db, create_tables, init_default_data,
    Note, Goal, Tag, Analysis, NoteTemplate, Milestone, GoalCategory, SleepSchedule
)

app = FastAPI(title="Flourish.ai API")

# Create tables on startup
create_tables()
init_default_data()

origins = [
    "http://localhost:5173",
    "http://localhost:5174",
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic models for API
class HourNote(BaseModel):
    time: int
    note: str

class NoteCreate(BaseModel):
    date: str
    hour: int
    content: str
    rich_content: Optional[dict] = None
    tag_names: Optional[List[str]] = []
    template_id: Optional[str] = None
    is_sleep: Optional[bool] = False
    sleep_quality: Optional[int] = None
    sleep_notes: Optional[str] = ""

class NoteResponse(BaseModel):
    id: int
    date: str
    hour: int
    content: str
    rich_content: Optional[dict]
    tags: List[str]
    template_id: Optional[str]
    is_sleep: bool
    sleep_quality: Optional[int]
    sleep_notes: Optional[str]
    created_at: datetime
    updated_at: datetime

class GoalCreate(BaseModel):
    title: str
    description: str
    category: str
    target_date: Optional[datetime] = None
    is_smart: bool = True
    specific: Optional[str] = None
    measurable: Optional[str] = None
    achievable: Optional[str] = None
    relevant: Optional[str] = None
    time_bound: Optional[str] = None

class GoalUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    target_date: Optional[datetime] = None
    progress: Optional[float] = None
    status: Optional[str] = None
    specific: Optional[str] = None
    measurable: Optional[str] = None
    achievable: Optional[str] = None
    relevant: Optional[str] = None
    time_bound: Optional[str] = None

class GoalResponse(BaseModel):
    id: int
    title: str
    description: str
    category: str
    target_date: Optional[datetime]
    progress: float
    status: str
    is_smart: bool
    specific: Optional[str]
    measurable: Optional[str]
    achievable: Optional[str]
    relevant: Optional[str]
    time_bound: Optional[str]
    created_at: datetime
    updated_at: datetime

class TagCreate(BaseModel):
    name: str
    color: str = "#3B82F6"

class TagResponse(BaseModel):
    id: int
    name: str
    color: str
    created_at: datetime

class AnalysisRequest(BaseModel):
    notes: List[HourNote]
    goals: str
    date: Optional[str] = None

class AnalysisResponse(BaseModel):
    analysis: str
    processing_time: float
    date: str

class TimetableRequest(BaseModel):
    analysis: str
    goals: str
    date: str
    preferences: Optional[Dict[str, str]] = {}

class TimeSlot(BaseModel):
    hour: int
    activity: str
    description: str
    priority: str  # "high", "medium", "low"
    category: str  # "work", "study", "break", "personal", "exercise", etc.

class TimetableResponse(BaseModel):
    date: str
    schedule: List[TimeSlot]
    summary: str
    processing_time: float

class AnalyticsRequest(BaseModel):
    start_date: str
    end_date: str
    analysis_type: str  # "patterns", "trends", "goals", "weekly", "monthly"

class PatternAnalysis(BaseModel):
    pattern_type: str
    description: str
    frequency: int
    confidence: float
    recommendations: List[str]

class TrendData(BaseModel):
    date: str
    value: float
    category: str

class AnalyticsResponse(BaseModel):
    analysis_type: str
    start_date: str
    end_date: str
    summary: str
    patterns: List[PatternAnalysis]
    trends: List[TrendData]
    insights: List[str]
    processing_time: float

class TemplateResponse(BaseModel):
    id: int
    name: str
    content: str
    description: str
    category: str

class SleepScheduleCreate(BaseModel):
    start_hour: int
    end_hour: int
    default_quality: Optional[int] = None

class SleepScheduleUpdate(BaseModel):
    start_hour: Optional[int] = None
    end_hour: Optional[int] = None
    default_quality: Optional[int] = None
    is_active: Optional[bool] = None

class SleepScheduleResponse(BaseModel):
    id: int
    start_hour: int
    end_hour: int
    default_quality: Optional[int]
    is_active: bool
    created_at: datetime
    updated_at: datetime

# Sleep Schedule endpoints
@app.get("/sleep-schedule", response_model=Optional[SleepScheduleResponse])
def get_active_sleep_schedule(db: Session = Depends(get_db)):
    schedule = db.query(SleepSchedule).filter(SleepSchedule.is_active == True).first()
    return schedule

@app.post("/sleep-schedule", response_model=SleepScheduleResponse)
def create_or_update_sleep_schedule(schedule: SleepScheduleCreate, db: Session = Depends(get_db)):
    # Deactivate any existing active schedules
    existing_schedules = db.query(SleepSchedule).filter(SleepSchedule.is_active == True).all()
    for existing in existing_schedules:
        existing.is_active = False
    
    # Create new active schedule
    db_schedule = SleepSchedule(
        start_hour=schedule.start_hour,
        end_hour=schedule.end_hour,
        default_quality=schedule.default_quality,
        is_active=True
    )
    
    db.add(db_schedule)
    db.commit()
    db.refresh(db_schedule)
    return db_schedule

@app.put("/sleep-schedule/{schedule_id}", response_model=SleepScheduleResponse)
def update_sleep_schedule(schedule_id: int, schedule: SleepScheduleUpdate, db: Session = Depends(get_db)):
    db_schedule = db.query(SleepSchedule).filter(SleepSchedule.id == schedule_id).first()
    if not db_schedule:
        raise HTTPException(status_code=404, detail="Sleep schedule not found")
    
    update_data = schedule.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_schedule, field, value)
    
    db_schedule.updated_at = datetime.now()
    db.commit()
    db.refresh(db_schedule)
    return db_schedule

@app.post("/apply-sleep-schedule/{date}")
def apply_sleep_schedule_to_date(date: str, db: Session = Depends(get_db)):
    # Get the active sleep schedule
    schedule = db.query(SleepSchedule).filter(SleepSchedule.is_active == True).first()
    if not schedule:
        raise HTTPException(status_code=404, detail="No active sleep schedule found")
    
    # Clear existing sleep notes for this date
    existing_sleep_notes = db.query(Note).filter(
        Note.date == date,
        Note.is_sleep == True
    ).all()
    
    for note in existing_sleep_notes:
        db.delete(note)
    
    # Calculate sleep hours
    sleep_hours = []
    if schedule.start_hour < schedule.end_hour:
        # Same day sleep (unusual but possible)
        sleep_hours = list(range(schedule.start_hour, schedule.end_hour))
    else:
        # Overnight sleep (normal case)
        sleep_hours = list(range(schedule.start_hour, 24)) + list(range(0, schedule.end_hour))
    
    # Create sleep notes for each hour
    for hour in sleep_hours:
        sleep_note = Note(
            date=date,
            hour=hour,
            content="",
            is_sleep=True,
            sleep_quality=schedule.default_quality,
            sleep_notes=""
        )
        db.add(sleep_note)
    
    db.commit()
    return {"message": f"Applied sleep schedule to {date}", "sleep_hours": sleep_hours}

# Notes endpoints
@app.post("/notes", response_model=NoteResponse)
def create_note(note: NoteCreate, db: Session = Depends(get_db)):
    # Create the note
    db_note = Note(
        date=note.date,
        hour=note.hour,
        content=note.content,
        rich_content=note.rich_content,
        template_id=note.template_id,
        is_sleep=note.is_sleep or False,
        sleep_quality=note.sleep_quality,
        sleep_notes=note.sleep_notes or ""
    )
    
    # Add tags if provided and not a sleep entry
    if note.tag_names and not note.is_sleep:
        for tag_name in note.tag_names:
            tag = db.query(Tag).filter(Tag.name == tag_name).first()
            if tag:
                db_note.tags.append(tag)
    
    db.add(db_note)
    db.commit()
    db.refresh(db_note)
    
    return NoteResponse(
        id=db_note.id,
        date=db_note.date,
        hour=db_note.hour,
        content=db_note.content,
        rich_content=db_note.rich_content,
        tags=[tag.name for tag in db_note.tags],
        template_id=db_note.template_id,
        is_sleep=db_note.is_sleep,
        sleep_quality=db_note.sleep_quality,
        sleep_notes=db_note.sleep_notes or "",
        created_at=db_note.created_at,
        updated_at=db_note.updated_at
    )

@app.get("/notes", response_model=List[NoteResponse])
def get_notes(
    date: Optional[str] = Query(None),
    tag: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    query = db.query(Note)
    
    if date:
        query = query.filter(Note.date == date)
    
    if tag:
        query = query.join(Note.tags).filter(Tag.name == tag)
    
    if search:
        query = query.filter(Note.content.contains(search))
    
    notes = query.order_by(Note.date.desc(), Note.hour.asc()).all()
    
    return [
        NoteResponse(
            id=note.id,
            date=note.date,
            hour=note.hour,
            content=note.content,
            rich_content=note.rich_content,
            tags=[tag.name for tag in note.tags],
            template_id=note.template_id,
            is_sleep=note.is_sleep,
            sleep_quality=note.sleep_quality,
            sleep_notes=note.sleep_notes or "",
            created_at=note.created_at,
            updated_at=note.updated_at
        )
        for note in notes
    ]

@app.get("/notes/date/{date}")
def get_notes_by_date(date: str, db: Session = Depends(get_db)):
    notes = db.query(Note).filter(Note.date == date).order_by(Note.hour).all()
    
    # Create a full 24-hour structure
    hourly_notes = {}
    for note in notes:
        hourly_notes[note.hour] = {
            "id": note.id,
            "content": note.content,
            "rich_content": note.rich_content,
            "tags": [tag.name for tag in note.tags],
            "template_id": note.template_id,
            "is_sleep": note.is_sleep,
            "sleep_quality": note.sleep_quality,
            "sleep_notes": note.sleep_notes or ""
        }
    
    # Fill in empty hours
    result = []
    for hour in range(24):
        result.append({
            "time": hour,
            "note": hourly_notes.get(hour, {}).get("content", ""),
            "rich_content": hourly_notes.get(hour, {}).get("rich_content"),
            "tags": hourly_notes.get(hour, {}).get("tags", []),
            "template_id": hourly_notes.get(hour, {}).get("template_id"),
            "id": hourly_notes.get(hour, {}).get("id"),
            "is_sleep": hourly_notes.get(hour, {}).get("is_sleep", False),
            "sleep_quality": hourly_notes.get(hour, {}).get("sleep_quality"),
            "sleep_notes": hourly_notes.get(hour, {}).get("sleep_notes", "")
        })
    
    return result

@app.put("/notes/{note_id}", response_model=NoteResponse)
def update_note(note_id: int, note: NoteCreate, db: Session = Depends(get_db)):
    db_note = db.query(Note).filter(Note.id == note_id).first()
    if not db_note:
        raise HTTPException(status_code=404, detail="Note not found")
    
    db_note.content = note.content
    db_note.rich_content = note.rich_content
    db_note.template_id = note.template_id
    db_note.is_sleep = note.is_sleep or False
    db_note.sleep_quality = note.sleep_quality
    db_note.sleep_notes = note.sleep_notes or ""
    db_note.updated_at = datetime.now()
    
    # Update tags (only if not sleep mode)
    db_note.tags.clear()
    if note.tag_names and not note.is_sleep:
        for tag_name in note.tag_names:
            tag = db.query(Tag).filter(Tag.name == tag_name).first()
            if tag:
                db_note.tags.append(tag)
    
    db.commit()
    db.refresh(db_note)
    
    return NoteResponse(
        id=db_note.id,
        date=db_note.date,
        hour=db_note.hour,
        content=db_note.content,
        rich_content=db_note.rich_content,
        tags=[tag.name for tag in db_note.tags],
        template_id=db_note.template_id,
        is_sleep=db_note.is_sleep,
        sleep_quality=db_note.sleep_quality,
        sleep_notes=db_note.sleep_notes or "",
        created_at=db_note.created_at,
        updated_at=db_note.updated_at
    )

# Goals endpoints
@app.post("/goals", response_model=GoalResponse)
def create_goal(goal: GoalCreate, db: Session = Depends(get_db)):
    db_goal = Goal(**goal.dict())
    db.add(db_goal)
    db.commit()
    db.refresh(db_goal)
    return db_goal

@app.get("/goals", response_model=List[GoalResponse])
def get_goals(
    status: Optional[str] = Query(None),
    category: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    query = db.query(Goal)
    
    if status:
        query = query.filter(Goal.status == status)
    
    if category:
        query = query.filter(Goal.category == category)
    
    return query.order_by(Goal.created_at.desc()).all()

@app.put("/goals/{goal_id}", response_model=GoalResponse)
def update_goal(goal_id: int, goal: GoalUpdate, db: Session = Depends(get_db)):
    db_goal = db.query(Goal).filter(Goal.id == goal_id).first()
    if not db_goal:
        raise HTTPException(status_code=404, detail="Goal not found")
    
    update_data = goal.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_goal, field, value)
    
    db_goal.updated_at = datetime.now()
    db.commit()
    db.refresh(db_goal)
    return db_goal

# Add after the existing goal endpoints, before tags endpoints

class MilestoneCreate(BaseModel):
    goal_id: int
    title: str
    description: str = ""
    target_date: Optional[datetime] = None

class MilestoneUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    target_date: Optional[datetime] = None
    completed: Optional[bool] = None

class MilestoneResponse(BaseModel):
    id: int
    goal_id: int
    title: str
    description: str
    target_date: Optional[datetime]
    completed: bool
    completed_at: Optional[datetime]
    created_at: datetime

@app.get("/goals/{goal_id}", response_model=GoalResponse)
def get_goal(goal_id: int, db: Session = Depends(get_db)):
    goal = db.query(Goal).filter(Goal.id == goal_id).first()
    if not goal:
        raise HTTPException(status_code=404, detail="Goal not found")
    return goal

@app.delete("/goals/{goal_id}")
def delete_goal(goal_id: int, db: Session = Depends(get_db)):
    goal = db.query(Goal).filter(Goal.id == goal_id).first()
    if not goal:
        raise HTTPException(status_code=404, detail="Goal not found")
    
    # Delete associated milestones
    db.query(Milestone).filter(Milestone.goal_id == goal_id).delete()
    db.delete(goal)
    db.commit()
    return {"message": "Goal deleted successfully"}

# Milestone endpoints
@app.post("/milestones", response_model=MilestoneResponse)
def create_milestone(milestone: MilestoneCreate, db: Session = Depends(get_db)):
    # Verify goal exists
    goal = db.query(Goal).filter(Goal.id == milestone.goal_id).first()
    if not goal:
        raise HTTPException(status_code=404, detail="Goal not found")
    
    db_milestone = Milestone(**milestone.dict())
    db.add(db_milestone)
    db.commit()
    db.refresh(db_milestone)
    return db_milestone

@app.get("/goals/{goal_id}/milestones", response_model=List[MilestoneResponse])
def get_milestones(goal_id: int, db: Session = Depends(get_db)):
    return db.query(Milestone).filter(Milestone.goal_id == goal_id).order_by(Milestone.target_date.asc(), Milestone.created_at.asc()).all()

@app.put("/milestones/{milestone_id}", response_model=MilestoneResponse)
def update_milestone(milestone_id: int, milestone: MilestoneUpdate, db: Session = Depends(get_db)):
    db_milestone = db.query(Milestone).filter(Milestone.id == milestone_id).first()
    if not db_milestone:
        raise HTTPException(status_code=404, detail="Milestone not found")
    
    update_data = milestone.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_milestone, field, value)
    
    # Set completed_at if milestone is being marked as completed
    if milestone.completed and not db_milestone.completed_at:
        db_milestone.completed_at = datetime.now()
    elif not milestone.completed:
        db_milestone.completed_at = None
    
    db.commit()
    db.refresh(db_milestone)
    
    # Update goal progress based on milestone completion
    update_goal_progress(db_milestone.goal_id, db)
    
    return db_milestone

@app.delete("/milestones/{milestone_id}")
def delete_milestone(milestone_id: int, db: Session = Depends(get_db)):
    milestone = db.query(Milestone).filter(Milestone.id == milestone_id).first()
    if not milestone:
        raise HTTPException(status_code=404, detail="Milestone not found")
    
    goal_id = milestone.goal_id
    db.delete(milestone)
    db.commit()
    
    # Update goal progress after milestone deletion
    update_goal_progress(goal_id, db)
    
    return {"message": "Milestone deleted successfully"}

def update_goal_progress(goal_id: int, db: Session):
    """Auto-calculate goal progress based on completed milestones"""
    goal = db.query(Goal).filter(Goal.id == goal_id).first()
    if not goal:
        return
    
    milestones = db.query(Milestone).filter(Milestone.goal_id == goal_id).all()
    if not milestones:
        return
    
    completed_milestones = len([m for m in milestones if m.completed])
    total_milestones = len(milestones)
    
    progress = (completed_milestones / total_milestones) * 100 if total_milestones > 0 else 0
    goal.progress = round(progress, 1)
    
    # Auto-update status based on progress
    if progress == 100 and goal.status == 'active':
        goal.status = 'completed'
    elif progress > 0 and goal.status == 'completed':
        goal.status = 'active'  # Reopen if progress drops below 100%
    
    db.commit()

# Update the existing goals endpoint to include milestones
@app.get("/goals-with-milestones", response_model=List[dict])
def get_goals_with_milestones(
    status: Optional[str] = Query(None),
    category: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    query = db.query(Goal)
    
    if status:
        query = query.filter(Goal.status == status)
    
    if category:
        query = query.filter(Goal.category == category)
    
    goals = query.order_by(Goal.created_at.desc()).all()
    
    result = []
    for goal in goals:
        milestones = db.query(Milestone).filter(Milestone.goal_id == goal.id).order_by(Milestone.target_date.asc()).all()
        goal_dict = {
            "id": goal.id,
            "title": goal.title,
            "description": goal.description,
            "category": goal.category,
            "target_date": goal.target_date,
            "progress": goal.progress,
            "status": goal.status,
            "is_smart": goal.is_smart,
            "specific": goal.specific,
            "measurable": goal.measurable,
            "achievable": goal.achievable,
            "relevant": goal.relevant,
            "time_bound": goal.time_bound,
            "created_at": goal.created_at,
            "updated_at": goal.updated_at,
            "milestones": [
                {
                    "id": m.id,
                    "title": m.title,
                    "description": m.description,
                    "target_date": m.target_date,
                    "completed": m.completed,
                    "completed_at": m.completed_at,
                    "created_at": m.created_at
                }
                for m in milestones
            ]
        }
        result.append(goal_dict)
    
    return result

# Add category management models and endpoints before tags endpoints

class GoalCategoryCreate(BaseModel):
    name: str
    description: str = ""
    icon: str = "Target"
    color: str = "#3B82F6"

class GoalCategoryUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    icon: Optional[str] = None
    color: Optional[str] = None

class GoalCategoryResponse(BaseModel):
    id: int
    name: str
    description: str
    icon: str
    color: str
    is_default: bool
    created_at: datetime
    updated_at: datetime

# Goal Category endpoints
@app.get("/goal-categories", response_model=List[GoalCategoryResponse])
def get_goal_categories(db: Session = Depends(get_db)):
    return db.query(GoalCategory).order_by(GoalCategory.is_default.desc(), GoalCategory.name.asc()).all()

@app.post("/goal-categories", response_model=GoalCategoryResponse)
def create_goal_category(category: GoalCategoryCreate, db: Session = Depends(get_db)):
    # Check if category name already exists
    existing = db.query(GoalCategory).filter(GoalCategory.name == category.name).first()
    if existing:
        raise HTTPException(status_code=400, detail="Category name already exists")
    
    db_category = GoalCategory(**category.dict(), is_default=False)
    db.add(db_category)
    db.commit()
    db.refresh(db_category)
    return db_category

@app.get("/goal-categories/{category_id}", response_model=GoalCategoryResponse)
def get_goal_category(category_id: int, db: Session = Depends(get_db)):
    category = db.query(GoalCategory).filter(GoalCategory.id == category_id).first()
    if not category:
        raise HTTPException(status_code=404, detail="Goal category not found")
    return category

@app.put("/goal-categories/{category_id}", response_model=GoalCategoryResponse)
def update_goal_category(category_id: int, category: GoalCategoryUpdate, db: Session = Depends(get_db)):
    db_category = db.query(GoalCategory).filter(GoalCategory.id == category_id).first()
    if not db_category:
        raise HTTPException(status_code=404, detail="Goal category not found")
    
    # Check if new name conflicts with existing category
    if category.name and category.name != db_category.name:
        existing = db.query(GoalCategory).filter(GoalCategory.name == category.name).first()
        if existing:
            raise HTTPException(status_code=400, detail="Category name already exists")
    
    update_data = category.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_category, field, value)
    
    db_category.updated_at = datetime.now()
    db.commit()
    db.refresh(db_category)
    return db_category

@app.delete("/goal-categories/{category_id}")
def delete_goal_category(category_id: int, db: Session = Depends(get_db)):
    category = db.query(GoalCategory).filter(GoalCategory.id == category_id).first()
    if not category:
        raise HTTPException(status_code=404, detail="Goal category not found")
    
    # Prevent deletion of default categories
    if category.is_default:
        raise HTTPException(status_code=400, detail="Cannot delete default categories")
    
    # Check if category is being used by any goals
    goals_using_category = db.query(Goal).filter(Goal.category == category.name).count()
    if goals_using_category > 0:
        raise HTTPException(
            status_code=400, 
            detail=f"Cannot delete category. {goals_using_category} goals are using this category."
        )
    
    db.delete(category)
    db.commit()
    return {"message": "Goal category deleted successfully"}

# Tags endpoints
@app.get("/tags", response_model=List[TagResponse])
def get_tags(db: Session = Depends(get_db)):
    return db.query(Tag).order_by(Tag.name).all()

@app.post("/tags", response_model=TagResponse)
def create_tag(tag: TagCreate, db: Session = Depends(get_db)):
    db_tag = Tag(**tag.dict())
    db.add(db_tag)
    db.commit()
    db.refresh(db_tag)
    return db_tag

# Templates endpoints
@app.get("/templates", response_model=List[TemplateResponse])
def get_templates(category: Optional[str] = Query(None), db: Session = Depends(get_db)):
    query = db.query(NoteTemplate)
    
    if category:
        query = query.filter(NoteTemplate.category == category)
    
    return query.order_by(NoteTemplate.name).all()

# Analysis endpoint with caching
@app.post("/analyze", response_model=AnalysisResponse)
def analyze(request: AnalysisRequest, db: Session = Depends(get_db)):
    start_time = time.time()
    
    analysis_date = request.date or datetime.now().strftime("%Y-%m-%d")
    
    # Check if we have a recent analysis for today
    existing_analysis = db.query(Analysis).filter(
        Analysis.date == analysis_date
    ).order_by(Analysis.created_at.desc()).first()
    
    # Filter out empty notes and format them for the prompt
    formatted_notes = "\n".join(
        f"- {hour.time}:00: {hour.note}"
        for hour in request.notes if hour.note.strip()
    )

    # Enhanced prompt with more context
    prompt = f"""
    You are an AI personal growth and life optimization coach. The user has provided their notes on an hourly basis.
    Analyze the following hourly notes and overall goals to provide insights into the user's
    personal development, productivity, and progress. Identify patterns, optimization opportunities, and growth areas.
    
    Please structure your response with:
    1. **Daily Summary**: Overview of the day's activities and productivity
    2. **Key Patterns**: Notable patterns in thoughts, activities, or behaviors
    3. **Growth Opportunities**: Areas for improvement and optimization
    4. **Positive Highlights**: Achievements, progress, or effective strategies
    5. **Goal Progress**: Assessment of progress toward stated goals
    6. **Optimization Recommendations**: Specific, actionable suggestions for tomorrow

    Hourly Notes:
    {formatted_notes}

    Today's Goals:
    {request.goals}

    Analysis:
    """

    try:
        response = ollama.chat(model='phi3:mini', messages=[
            {
                'role': 'user',
                'content': prompt,
            },
        ])

        ai_response = response['message']['content']
        processing_time = time.time() - start_time
        
        # Update existing analysis or create new one
        if existing_analysis:
            # Update the existing analysis for this date
            existing_analysis.notes_content = [note.dict() for note in request.notes]
            existing_analysis.goals_content = request.goals
            existing_analysis.ai_response = ai_response
            existing_analysis.model_used = "phi3:mini"
            existing_analysis.processing_time = processing_time
            existing_analysis.created_at = datetime.now()  # Update timestamp
            db_analysis = existing_analysis
        else:
            # Create new analysis
            db_analysis = Analysis(
                date=analysis_date,
                notes_content=[note.dict() for note in request.notes],
                goals_content=request.goals,
                ai_response=ai_response,
                model_used="phi3:mini",
                processing_time=processing_time
            )
            db.add(db_analysis)
        
        db.commit()
        
        return AnalysisResponse(
            analysis=ai_response,
            processing_time=processing_time,
            date=analysis_date
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")

# Timetable generation endpoint
@app.post("/generate-timetable", response_model=TimetableResponse)
def generate_timetable(request: TimetableRequest, db: Session = Depends(get_db)):
    start_time = time.time()
    
    try:
        # Parse preferences with defaults
        wake_time = int(request.preferences.get("wake_time", "7"))
        sleep_time = int(request.preferences.get("sleep_time", "23"))
        focus_hours = int(request.preferences.get("focus_hours", "4"))
        break_frequency = int(request.preferences.get("break_frequency", "90"))  # minutes
        
        prompt = f"""
        Based on the following analysis and goals, create an optimized hour-by-hour schedule for tomorrow ({request.date}).
        
        ANALYSIS FROM TODAY:
        {request.analysis}
        
        CURRENT GOALS:
        {request.goals}
        
        PREFERENCES:
        - Wake up time: {wake_time}:00
        - Sleep time: {sleep_time}:00
        - Focus work blocks: {focus_hours} hours total
        - Break every: {break_frequency} minutes
        
        Create a JSON response with the following structure for each hour from {wake_time} to {sleep_time}:
        {{
            "hour": [hour number 0-23],
            "activity": "[short activity name]",
            "description": "[detailed description with specific actions]",
            "priority": "[high/medium/low]",
            "category": "[work/study/break/personal/exercise/meal/leisure]"
        }}
        
        GUIDELINES:
        1. Based on the analysis, prioritize areas that need improvement (like DSA study if that was identified as lacking)
        2. Include focused work/study blocks for skill development
        3. Add regular breaks to prevent burnout
        4. Balance productivity with self-care
        5. Include time for meals and personal activities
        6. Make it realistic and achievable
        7. Address specific issues mentioned in the analysis
        
        Provide ONLY a valid JSON array of time slots, no additional text.
        """

        response = ollama.chat(model='phi3:mini', messages=[
            {
                'role': 'user',
                'content': prompt,
            },
        ])

        ai_response = response['message']['content']
        processing_time = time.time() - start_time
        
        # Try to parse the JSON response
        try:
            import json
            import re
            
            # Extract JSON from response if it contains other text
            json_match = re.search(r'\[.*\]', ai_response, re.DOTALL)
            if json_match:
                json_str = json_match.group()
            else:
                json_str = ai_response
            
            schedule_data = json.loads(json_str)
            
            # Validate and convert to TimeSlot objects
            schedule = []
            for slot in schedule_data:
                if isinstance(slot, dict) and all(k in slot for k in ['hour', 'activity', 'description', 'priority', 'category']):
                    schedule.append(TimeSlot(**slot))
            
            if not schedule:
                raise ValueError("No valid time slots found")
                
        except (json.JSONDecodeError, ValueError) as e:
            # Fallback to generated schedule if AI response is malformed
            schedule = generate_fallback_schedule(wake_time, sleep_time, focus_hours, request.analysis)
        
        # Generate summary
        summary = f"Optimized schedule for {request.date} with {len(schedule)} time blocks, focusing on areas identified in your analysis."
        
        return TimetableResponse(
            date=request.date,
            schedule=schedule,
            summary=summary,
            processing_time=processing_time
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Timetable generation failed: {str(e)}")

def generate_fallback_schedule(wake_time: int, sleep_time: int, focus_hours: int, analysis: str) -> List[TimeSlot]:
    """Generate a basic fallback schedule if AI parsing fails"""
    schedule = []
    current_hour = wake_time
    
    # Morning routine
    schedule.append(TimeSlot(
        hour=current_hour,
        activity="Morning Routine",
        description="Wake up, hygiene, light breakfast, prepare for the day",
        priority="medium",
        category="personal"
    ))
    current_hour += 1
    
    # Study/work blocks based on analysis
    if "DSA" in analysis or "Data Structures" in analysis:
        for i in range(focus_hours):
            if current_hour < sleep_time - 2:
                schedule.append(TimeSlot(
                    hour=current_hour,
                    activity="DSA Study",
                    description="Focused study on Data Structures and Algorithms - practice problems and concepts",
                    priority="high",
                    category="study"
                ))
                current_hour += 1
                
                # Add break after study
                if i < focus_hours - 1 and current_hour < sleep_time - 1:
                    schedule.append(TimeSlot(
                        hour=current_hour,
                        activity="Break",
                        description="Rest, hydration, light movement",
                        priority="medium",
                        category="break"
                    ))
                    current_hour += 1
    
    # Fill remaining hours with balanced activities
    while current_hour < sleep_time:
        if current_hour == 12 or current_hour == 18:  # Meal times
            meal = "Lunch" if current_hour == 12 else "Dinner"
            schedule.append(TimeSlot(
                hour=current_hour,
                activity=meal,
                description=f"Healthy {meal.lower()} and brief relaxation",
                priority="medium",
                category="meal"
            ))
        elif current_hour > 20:  # Evening
            schedule.append(TimeSlot(
                hour=current_hour,
                activity="Evening Routine",
                description="Wind down, reflect on day, prepare for tomorrow",
                priority="low",
                category="personal"
            ))
        else:
            schedule.append(TimeSlot(
                hour=current_hour,
                activity="Productive Work",
                description="Continue with important tasks and skill development",
                priority="medium",
                category="work"
            ))
        current_hour += 1
    
    return schedule

# Add AI generation for SMART goal fields after the analyze endpoint

class SMARTFieldGenerationRequest(BaseModel):
    goal_title: str
    field_type: str  # "description", "specific", "measurable", "achievable", "relevant", "time_bound"
    category: str = "Personal"
    existing_content: Dict[str, Union[str, bool]] = {}

@app.post("/generate-smart-field")
def generate_smart_field(request: SMARTFieldGenerationRequest):
    try:
        # Create context-aware prompts for each field type
        prompts = {
            "description": f"""
                Goal Title: "{request.goal_title}"
                Category: {request.category}
                
                Write a clear, motivating 2-3 sentence description for this goal. Focus on why this goal matters and what achieving it would mean. Keep it inspiring but realistic.
                
                Example format: "This goal focuses on [specific area] to help me [benefit/outcome]. By achieving this, I will [impact on life/career/wellbeing]. This aligns with my desire to [bigger picture/values]."
                
                Description:""",
                
            "specific": f"""
                Goal: "{request.goal_title}"
                Category: {request.category}
                
                Make this goal specific and clear. Define exactly what will be accomplished, avoiding vague terms. Answer: What exactly will be done?
                
                Example: Instead of "learn programming" → "Complete a Python web development course and build 3 portfolio projects"
                
                Specific goal:""",
                
            "measurable": f"""
                Goal: "{request.goal_title}"
                Category: {request.category}
                {f"Specific criteria: {request.existing_content.get('specific', '')}" if request.existing_content.get('specific') else ""}
                
                Define how progress and completion will be measured. Include numbers, quantities, or clear completion criteria. Answer: How will I know when it's accomplished?
                
                Example: "Complete 40 hours of coursework, submit 3 projects, pass final assessment with 80%+ score"
                
                Measurable criteria:""",
                
            "achievable": f"""
                Goal: "{request.goal_title}"
                Category: {request.category}
                
                Assess if this goal is realistic and attainable given typical constraints. Consider time, resources, and skills needed. Answer: Is this goal realistic?
                
                Example: "Given my current schedule of 1-2 hours per day for learning, this 3-month timeline is achievable with consistent effort"
                
                Achievability assessment:""",
                
            "relevant": f"""
                Goal: "{request.goal_title}"
                Category: {request.category}
                
                Explain why this goal matters and how it aligns with broader objectives or values. Answer: Why is this goal important?
                
                Example: "This skill will advance my career prospects, increase my problem-solving abilities, and align with my goal of transitioning to tech"
                
                Relevance:""",
                
            "time_bound": f"""
                Goal: "{request.goal_title}"
                Category: {request.category}
                {f"Specific: {request.existing_content.get('specific', '')}" if request.existing_content.get('specific') else ""}
                {f"Measurable: {request.existing_content.get('measurable', '')}" if request.existing_content.get('measurable') else ""}
                
                Set a realistic timeline with specific deadlines or milestones. Answer: When will this be completed?
                
                Example: "Complete by March 15th, with weekly milestones: Week 1-4: Course modules, Week 5-8: Project 1, Week 9-12: Projects 2&3"
                
                Timeline:"""
        }
        
        if request.field_type not in prompts:
            raise HTTPException(status_code=400, detail="Invalid field type")
        
        prompt = prompts[request.field_type]
        
        # Generate using Ollama
        try:
            response = ollama.generate(
                model='phi3:mini',
                prompt=prompt,
                options={
                    'temperature': 0.7,
                    'max_tokens': 200,
                    'stop': ['\n\n', 'Goal:', 'Example:', 'Note:']
                }
            )
            
            generated_content = response['response'].strip()
            
            # Clean up the response (remove any prompt echoes)
            lines = generated_content.split('\n')
            # Take the first substantial line that doesn't repeat the prompt
            for line in lines:
                line = line.strip()
                if line and not line.endswith(':') and len(line) > 10:
                    generated_content = line
                    break
            
            return {
                "field_type": request.field_type,
                "generated_content": generated_content,
                "goal_title": request.goal_title
            }
            
        except Exception as e:
            print(f"Ollama generation error: {e}")
            # Fallback suggestions if Ollama fails
            fallbacks = {
                "description": f"A focused goal to develop skills and knowledge in {request.category.lower()}, contributing to personal and professional growth.",
                "specific": f"Complete specific milestones and deliverables related to {request.goal_title.lower()}.",
                "measurable": "Track progress through concrete metrics, deadlines, and completion criteria.",
                "achievable": "This goal is realistic given adequate time commitment and available resources.",
                "relevant": f"This goal aligns with personal development objectives in the {request.category.lower()} category.",
                "time_bound": "Set a specific timeline with weekly or monthly milestones leading to completion."
            }
            
            return {
                "field_type": request.field_type,
                "generated_content": fallbacks.get(request.field_type, "Please fill in this field based on your specific goal."),
                "goal_title": request.goal_title,
                "fallback_used": True
            }
    
    except Exception as e:
        print(f"Error in generate_smart_field: {e}")
        raise HTTPException(status_code=500, detail="Failed to generate field content")

# Analysis history endpoint
@app.get("/analysis/history")
def get_analysis_history(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    search: Optional[str] = Query(None),
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    query = db.query(Analysis)
    
    # Apply filters
    if search:
        query = query.filter(Analysis.ai_response.contains(search))
    if start_date:
        query = query.filter(Analysis.date >= start_date)
    if end_date:
        query = query.filter(Analysis.date <= end_date)
    
    # Get total count for pagination
    total_count = query.count()
    
    # Apply pagination
    offset = (page - 1) * page_size
    analyses = query.order_by(Analysis.created_at.desc()).offset(offset).limit(page_size).all()
    
    # Create summary for each analysis (first 200 characters)
    def create_summary(text):
        if not text:
            return ""
        summary = text[:200].strip()
        if len(text) > 200:
            summary += "..."
        return summary
    
    return {
        "analyses": [
            {
                "id": analysis.id,
                "date": analysis.date,
                "analysis": analysis.ai_response,
                "summary": create_summary(analysis.ai_response),
                "processing_time": analysis.processing_time,
                "created_at": analysis.created_at
            }
            for analysis in analyses
        ],
        "pagination": {
            "page": page,
            "page_size": page_size,
            "total_count": total_count,
            "total_pages": (total_count + page_size - 1) // page_size,
            "has_next": page * page_size < total_count,
            "has_prev": page > 1
        }
    }

# Export endpoints
@app.get("/export/notes")
def export_notes(
    format: str = Query("json", regex="^(json|csv)$"),
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    query = db.query(Note)
    
    if start_date:
        query = query.filter(Note.date >= start_date)
    if end_date:
        query = query.filter(Note.date <= end_date)
    
    notes = query.order_by(Note.date, Note.hour).all()
    
    if format == "json":
        return {
            "notes": [
                {
                    "id": note.id,
                    "date": note.date,
                    "hour": note.hour,
                    "content": note.content,
                    "tags": [tag.name for tag in note.tags],
                    "created_at": note.created_at.isoformat(),
                    "updated_at": note.updated_at.isoformat()
                }
                for note in notes
            ],
            "exported_at": datetime.now().isoformat(),
            "total_notes": len(notes)
        }
    else:  # CSV format
        import pandas as pd
        from io import StringIO
        
        data = []
        for note in notes:
            data.append({
                "id": note.id,
                "date": note.date,
                "hour": note.hour,
                "content": note.content,
                "tags": ", ".join([tag.name for tag in note.tags]),
                "created_at": note.created_at.isoformat(),
                "updated_at": note.updated_at.isoformat()
            })
        
        df = pd.DataFrame(data)
        csv_buffer = StringIO()
        df.to_csv(csv_buffer, index=False)
        
        return {"csv_data": csv_buffer.getvalue()}

@app.get("/export/goals")
def export_goals(
    format: str = Query("json", regex="^(json|csv)$"),
    db: Session = Depends(get_db)
):
    goals = db.query(Goal).order_by(Goal.created_at.desc()).all()
    
    if format == "json":
        return {
            "goals": [
                {
                    "id": goal.id,
                    "title": goal.title,
                    "description": goal.description,
                    "category": goal.category,
                    "progress": goal.progress,
                    "status": goal.status,
                    "target_date": goal.target_date.isoformat() if goal.target_date else None,
                    "created_at": goal.created_at.isoformat(),
                    "updated_at": goal.updated_at.isoformat()
                }
                for goal in goals
            ],
            "exported_at": datetime.now().isoformat(),
            "total_goals": len(goals)
        }
    else:  # CSV format
        import pandas as pd
        from io import StringIO
        
        data = []
        for goal in goals:
            data.append({
                "id": goal.id,
                "title": goal.title,
                "description": goal.description,
                "category": goal.category,
                "progress": goal.progress,
                "status": goal.status,
                "target_date": goal.target_date.isoformat() if goal.target_date else "",
                "created_at": goal.created_at.isoformat(),
                "updated_at": goal.updated_at.isoformat()
            })
        
        df = pd.DataFrame(data)
        csv_buffer = StringIO()
        df.to_csv(csv_buffer, index=False)
        
        return {"csv_data": csv_buffer.getvalue()}

# Analytics endpoints
@app.post("/analytics", response_model=AnalyticsResponse)
def analyze_historical_data(request: AnalyticsRequest, db: Session = Depends(get_db)):
    start_time = time.time()
    
    try:
        # Get notes and analyses for the date range
        notes = db.query(Note).filter(
            Note.date >= request.start_date,
            Note.date <= request.end_date
        ).order_by(Note.date, Note.hour).all()
        
        analyses = db.query(Analysis).filter(
            Analysis.date >= request.start_date,
            Analysis.date <= request.end_date
        ).order_by(Analysis.date).all()
        
        goals = db.query(Goal).all()
        
        if request.analysis_type == "patterns":
            return analyze_patterns(notes, analyses, goals, request, start_time)
        elif request.analysis_type == "trends":
            return analyze_trends(notes, analyses, request, start_time)
        elif request.analysis_type == "goals":
            return analyze_goal_progress(goals, notes, analyses, request, start_time)
        elif request.analysis_type == "weekly":
            return analyze_weekly_summary(notes, analyses, request, start_time)
        elif request.analysis_type == "monthly":
            return analyze_monthly_summary(notes, analyses, request, start_time)
        else:
            raise HTTPException(status_code=400, detail="Invalid analysis type")
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analytics failed: {str(e)}")

def analyze_patterns(notes, analyses, goals, request, start_time):
    """Analyze patterns across multiple days"""
    
    # Group notes by day and extract activities
    daily_activities = {}
    for note in notes:
        if note.date not in daily_activities:
            daily_activities[note.date] = []
        if note.content.strip():
            daily_activities[note.date].append({
                'hour': note.hour,
                'content': note.content,
                'tags': [tag.name for tag in note.tags]
            })
    
    # Create AI prompt for pattern analysis
    activity_summary = ""
    for date, activities in daily_activities.items():
        activity_summary += f"\n{date}:\n"
        for activity in activities:
            activity_summary += f"  {activity['hour']}:00 - {activity['content'][:100]}\n"
    
    prompt = f"""
    Analyze the following journal entries from {request.start_date} to {request.end_date} for patterns, habits, and trends.
    
    JOURNAL ENTRIES:
    {activity_summary}
    
    ACTIVE GOALS:
    {chr(10).join([f"- {goal.title}: {goal.description}" for goal in goals if goal.status == 'active'])}
    
    Identify:
    1. Recurring behavioral patterns
    2. Time-of-day activity patterns  
    3. Productivity patterns
    4. Emotional/mood patterns
    5. Areas of consistent progress or struggle
    6. Habits that support or hinder goals
    
    Provide insights in a structured format focusing on:
    - What patterns you observe
    - How frequently they occur
    - Their impact on goals and wellbeing
    - Specific recommendations for optimization
    
    Analysis:
    """
    
    try:
        response = ollama.chat(model='phi3:mini', messages=[
            {'role': 'user', 'content': prompt}
        ])
        
        ai_analysis = response['message']['content']
        
        # Extract patterns (simplified - in a real app you might use more sophisticated NLP)
        patterns = [
            PatternAnalysis(
                pattern_type="Activity Pattern",
                description="Extracted from AI analysis",
                frequency=len(daily_activities),
                confidence=0.8,
                recommendations=["Based on AI analysis"]
            )
        ]
        
        processing_time = time.time() - start_time
        
        return AnalyticsResponse(
            analysis_type="patterns",
            start_date=request.start_date,
            end_date=request.end_date,
            summary=ai_analysis,
            patterns=patterns,
            trends=[],
            insights=[ai_analysis],
            processing_time=processing_time
        )
        
    except Exception as e:
        print(f"AI analysis failed: {e}")
        # Fallback analysis
        patterns = analyze_patterns_fallback(daily_activities, goals)
        
        return AnalyticsResponse(
            analysis_type="patterns",
            start_date=request.start_date,
            end_date=request.end_date,
            summary=f"Pattern analysis for {len(daily_activities)} days of data",
            patterns=patterns,
            trends=[],
            insights=["Fallback pattern analysis completed"],
            processing_time=time.time() - start_time
        )

def analyze_patterns_fallback(daily_activities, goals):
    """Fallback pattern analysis without AI"""
    patterns = []
    
    # Analyze time patterns
    hour_usage = {}
    for date, activities in daily_activities.items():
        for activity in activities:
            hour = activity['hour']
            if hour not in hour_usage:
                hour_usage[hour] = 0
            hour_usage[hour] += 1
    
    most_active_hours = sorted(hour_usage.items(), key=lambda x: x[1], reverse=True)[:3]
    
    patterns.append(PatternAnalysis(
        pattern_type="Time Usage",
        description=f"Most active hours: {', '.join([f'{h}:00' for h, c in most_active_hours])}",
        frequency=sum(hour_usage.values()),
        confidence=0.7,
        recommendations=[
            "Consider optimizing your most productive hours",
            "Plan important tasks during peak activity periods"
        ]
    ))
    
    # Activity consistency
    active_days = len(daily_activities)
    patterns.append(PatternAnalysis(
        pattern_type="Consistency",
        description=f"Journaling consistency: {active_days} days with entries",
        frequency=active_days,
        confidence=0.9,
        recommendations=[
            "Maintain consistent journaling habits" if active_days > 5 else "Try to journal more consistently"
        ]
    ))
    
    return patterns

def analyze_trends(notes, analyses, request, start_time):
    """Analyze trends over time"""
    
    # Calculate daily activity levels
    daily_activity = {}
    for note in notes:
        if note.date not in daily_activity:
            daily_activity[note.date] = 0
        if note.content.strip():
            daily_activity[note.date] += 1
    
    trends = []
    for date, count in daily_activity.items():
        trends.append(TrendData(
            date=date,
            value=float(count),
            category="activity_level"
        ))
    
    # Calculate average activity level
    avg_activity = sum(daily_activity.values()) / len(daily_activity) if daily_activity else 0
    
    summary = f"Average daily activity level: {avg_activity:.1f} entries per day"
    insights = [
        f"Analyzed {len(daily_activity)} days of data",
        f"Peak activity: {max(daily_activity.values()) if daily_activity else 0} entries",
        f"Most active day: {max(daily_activity, key=daily_activity.get) if daily_activity else 'N/A'}"
    ]
    
    return AnalyticsResponse(
        analysis_type="trends",
        start_date=request.start_date,
        end_date=request.end_date,
        summary=summary,
        patterns=[],
        trends=trends,
        insights=insights,
        processing_time=time.time() - start_time
    )

def analyze_goal_progress(goals, notes, analyses, request, start_time):
    """Analyze goal progress over time"""
    
    trends = []
    goal_insights = []
    
    for goal in goals:
        trends.append(TrendData(
            date=goal.created_at.strftime('%Y-%m-%d'),
            value=goal.progress,
            category=f"goal_{goal.id}"
        ))
        
        if goal.progress > 75:
            goal_insights.append(f"🎯 {goal.title}: Excellent progress ({goal.progress}%)")
        elif goal.progress > 50:
            goal_insights.append(f"📈 {goal.title}: Good progress ({goal.progress}%)")
        elif goal.progress > 25:
            goal_insights.append(f"⚠️ {goal.title}: Moderate progress ({goal.progress}%)")
        else:
            goal_insights.append(f"🚨 {goal.title}: Needs attention ({goal.progress}%)")
    
    active_goals = len([g for g in goals if g.status == 'active'])
    completed_goals = len([g for g in goals if g.status == 'completed'])
    
    summary = f"Goal Overview: {active_goals} active, {completed_goals} completed"
    
    patterns = [
        PatternAnalysis(
            pattern_type="Goal Achievement",
            description=f"Completion rate: {completed_goals}/{len(goals)} goals",
            frequency=completed_goals,
            confidence=0.9,
            recommendations=[
                "Break down large goals into smaller milestones",
                "Set specific deadlines for better accountability",
                "Review and adjust goals regularly"
            ]
        )
    ]
    
    return AnalyticsResponse(
        analysis_type="goals",
        start_date=request.start_date,
        end_date=request.end_date,
        summary=summary,
        patterns=patterns,
        trends=trends,
        insights=goal_insights,
        processing_time=time.time() - start_time
    )

def analyze_weekly_summary(notes, analyses, request, start_time):
    """Generate weekly summary analysis"""
    
    # Group notes by week
    from datetime import datetime, timedelta
    from collections import defaultdict
    
    weekly_data = defaultdict(list)
    
    for note in notes:
        note_date = datetime.strptime(note.date, '%Y-%m-%d')
        week_start = note_date - timedelta(days=note_date.weekday())
        week_key = week_start.strftime('%Y-%m-%d')
        weekly_data[week_key].append(note)
    
    insights = []
    trends = []
    
    for week_start, week_notes in weekly_data.items():
        entry_count = len([n for n in week_notes if n.content.strip()])
        
        trends.append(TrendData(
            date=week_start,
            value=float(entry_count),
            category="weekly_entries"
        ))
        
        insights.append(f"Week of {week_start}: {entry_count} journal entries")
    
    summary = f"Weekly analysis covering {len(weekly_data)} weeks"
    
    return AnalyticsResponse(
        analysis_type="weekly",
        start_date=request.start_date,
        end_date=request.end_date,
        summary=summary,
        patterns=[],
        trends=trends,
        insights=insights,
        processing_time=time.time() - start_time
    )

def analyze_monthly_summary(notes, analyses, request, start_time):
    """Generate monthly summary analysis"""
    
    from datetime import datetime
    from collections import defaultdict
    
    monthly_data = defaultdict(list)
    
    for note in notes:
        note_date = datetime.strptime(note.date, '%Y-%m-%d')
        month_key = note_date.strftime('%Y-%m')
        monthly_data[month_key].append(note)
    
    insights = []
    trends = []
    
    for month, month_notes in monthly_data.items():
        entry_count = len([n for n in month_notes if n.content.strip()])
        
        trends.append(TrendData(
            date=f"{month}-01",
            value=float(entry_count),
            category="monthly_entries"
        ))
        
        insights.append(f"{month}: {entry_count} total entries")
    
    summary = f"Monthly analysis covering {len(monthly_data)} months"
    
    return AnalyticsResponse(
        analysis_type="monthly",
        start_date=request.start_date,
        end_date=request.end_date,
        summary=summary,
        patterns=[],
        trends=trends,
        insights=insights,
        processing_time=time.time() - start_time
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 