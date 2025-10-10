from rest_framework import serializers
from .models import NotificationCampaign, NotificationTemplate, NotificationRule, NotificationPreference, NotificationSubscription

class NotificationCampaignSerializer(serializers.ModelSerializer):
    class Meta:
        model = NotificationCampaign
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at']

class NotificationTemplateSerializer(serializers.ModelSerializer):
    class Meta:
        model = NotificationTemplate
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at']

class NotificationRuleSerializer(serializers.ModelSerializer):
    class Meta:
        model = NotificationRule
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at']

class NotificationPreferenceSerializer(serializers.ModelSerializer):
    class Meta:
        model = NotificationPreference
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at']

class NotificationSubscriptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = NotificationSubscription
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at']