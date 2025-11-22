from django.db import models
from django.contrib.auth import get_user_model
from django.conf import settings
import uuid

User = get_user_model()

class ModelType(models.TextChoices):
    """Types of AI models"""
    TEXT = 'text', 'Text Model'
    VISION = 'vision', 'Vision Model'
    AUDIO = 'audio', 'Audio Model'
    VIDEO = 'video', 'Video Model'
    MULTIMODAL = 'multimodal', 'Multi-Modal Model'

class AIModelConfig(models.Model):
    """Configuration for AI models"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=200)
    model_type = models.CharField(max_length=20, choices=ModelType.choices)
    
    # Model details
    provider = models.CharField(max_length=100)  # groq, openai, huggingface, etc.
    model_id = models.CharField(max_length=200)  # Model identifier
    
    # Configuration
    config = models.JSONField(default=dict, help_text="Model configuration parameters")
    capabilities = models.JSONField(default=list, help_text="List of model capabilities")
    
    # Status
    is_active = models.BooleanField(default=True)
    is_default = models.BooleanField(default=False)
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True
    )
    
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['model_type', 'is_active']),
            models.Index(fields=['provider', 'is_active']),
        ]
    
    def __str__(self):
        return f"{self.name} ({self.model_type})"

class MultiModalSession(models.Model):
    """Session for multi-modal processing"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=200)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE, 
        related_name='multimodal_sessions'
    )
    
    # Session data
    input_modalities = models.JSONField(default=list, help_text="List of input modalities")
    output_modalities = models.JSONField(default=list, help_text="List of output modalities")
    processing_config = models.JSONField(default=dict)
    
    # Results
    results = models.JSONField(default=dict)
    context = models.JSONField(default=dict, help_text="Shared context across modalities")
    
    # Status
    status = models.CharField(
        max_length=20,
        choices=[
            ('pending', 'Pending'),
            ('processing', 'Processing'),
            ('completed', 'Completed'),
            ('failed', 'Failed'),
        ],
        default='pending'
    )
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', 'status']),
            models.Index(fields=['status', 'created_at']),
        ]
    
    def __str__(self):
        return f"{self.name} - {self.status}"

class ModalityResult(models.Model):
    """Results from processing a specific modality"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    session = models.ForeignKey(
        MultiModalSession, 
        on_delete=models.CASCADE, 
        related_name='modality_results'
    )
    
    # Modality info
    modality_type = models.CharField(max_length=50)  # text, image, audio, video
    model_used = models.ForeignKey(
        AIModelConfig, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True
    )
    
    # Processing details
    input_data = models.JSONField(default=dict)
    output_data = models.JSONField(default=dict)
    confidence_score = models.FloatField(default=0.0)
    
    # Performance
    processing_time = models.FloatField(default=0.0, help_text="Processing time in seconds")
    tokens_used = models.IntegerField(default=0)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['created_at']
        indexes = [
            models.Index(fields=['session', 'modality_type']),
        ]
    
    def __str__(self):
        return f"{self.modality_type} - {self.confidence_score}"

class CrossModalInsight(models.Model):
    """Insights generated from cross-modal analysis"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    session = models.ForeignKey(
        MultiModalSession, 
        on_delete=models.CASCADE, 
        related_name='cross_modal_insights'
    )
    
    # Insight details
    insight_type = models.CharField(max_length=100)  # correlation, contradiction, reinforcement
    involved_modalities = models.JSONField(default=list)
    
    # Content
    description = models.TextField()
    confidence = models.FloatField(default=0.0)
    evidence = models.JSONField(default=dict)
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-confidence', '-created_at']
    
    def __str__(self):
        return f"{self.insight_type} - {self.confidence}"
