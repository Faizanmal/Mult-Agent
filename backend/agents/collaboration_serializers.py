# Collaboration Serializers

from rest_framework import serializers
from .collaboration_models import CollaborationSession, TeamMember, Comment, ActivityLog, Notification, WorkflowLock, ChangeLog
from django.contrib.auth.models import User


class UserSerializer(serializers.ModelSerializer):
    """Simple user serializer for collaboration features."""
    
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name']
        read_only_fields = ['id']


class CollaborationSessionSerializer(serializers.ModelSerializer):
    """Serializer for collaboration sessions."""
    
    owner = UserSerializer(read_only=True)
    member_count = serializers.SerializerMethodField()
    
    class Meta:
        model = CollaborationSession
        fields = [
            'id', 'name', 'description', 'is_public', 'is_active', 'max_members',
            'session_data', 'settings', 'owner', 'workflow_id', 'member_count',
            'created_at', 'updated_at', 'last_activity'
        ]
        read_only_fields = ['id', 'owner', 'member_count', 'created_at', 'updated_at', 'last_activity']
    
    def get_member_count(self, obj):
        """Get the number of members in the session."""
        return obj.members.count()


class TeamMemberSerializer(serializers.ModelSerializer):
    """Serializer for team members."""
    
    user = UserSerializer(read_only=True)
    invited_by = UserSerializer(read_only=True)
    
    class Meta:
        model = TeamMember
        fields = [
            'id', 'session', 'user', 'role', 'permissions', 'status',
            'last_active', 'cursor_position', 'invited_by', 'joined_at'
        ]
        read_only_fields = ['id', 'user', 'invited_by', 'joined_at']


class CommentSerializer(serializers.ModelSerializer):
    """Serializer for comments."""
    
    author = UserSerializer(read_only=True)
    resolved_by = UserSerializer(read_only=True)
    
    class Meta:
        model = Comment
        fields = [
            'id', 'session', 'author', 'content', 'node_id',
            'resolved', 'resolved_by', 'resolved_at',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'author', 'resolved_by', 'resolved_at', 'created_at', 'updated_at']


class ActivityLogSerializer(serializers.ModelSerializer):
    """Serializer for activity logs."""
    
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = ActivityLog
        fields = [
            'id', 'session', 'user', 'action', 'details', 'timestamp'
        ]
        read_only_fields = ['id', 'timestamp']


class NotificationSerializer(serializers.ModelSerializer):
    """Serializer for notifications."""
    
    recipient = UserSerializer(read_only=True)
    sender = UserSerializer(read_only=True)
    
    class Meta:
        model = Notification
        fields = [
            'id', 'recipient', 'sender', 'session', 'notification_type',
            'title', 'message', 'data', 'read', 'read_at', 'created_at'
        ]
        read_only_fields = ['id', 'recipient', 'sender', 'read_at', 'created_at']


class WorkflowLockSerializer(serializers.ModelSerializer):
    """Serializer for workflow locks."""
    
    locked_by = UserSerializer(read_only=True)
    
    class Meta:
        model = WorkflowLock
        fields = [
            'id', 'session', 'workflow_id', 'node_id', 'locked_by',
            'lock_type', 'created_at', 'expires_at', 'last_heartbeat'
        ]
        read_only_fields = ['id', 'locked_by', 'created_at', 'last_heartbeat']


class ChangeLogSerializer(serializers.ModelSerializer):
    """Serializer for change logs."""
    
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = ChangeLog
        fields = [
            'id', 'session', 'user', 'workflow_id', 'change_type',
            'target_id', 'before_data', 'after_data', 'metadata', 'timestamp'
        ]
        read_only_fields = ['id', 'timestamp']