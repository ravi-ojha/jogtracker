"""
Serializers are a way to maintain the correct data format while
exchanging between database and client
"""

from rest_framework import serializers
from jogapp.models import Jog


class JogSerializer(serializers.Serializer):
    """
    Jog class serializer
    """
    user_id = serializers.IntegerField()
    timestamp = serializers.DateTimeField(format='%b %d, %Y')
    duration = serializers.IntegerField(min_value=0)
    distance = serializers.IntegerField(min_value=0)

    def create(self, validated_data):
        """
        Create and return a new `Jog` object using the validated data.
        """
        return Jog.objects.create(**validated_data)

    def update(self, instance, validated_data):
        """
        Update and return an existing `Snippet` instance, given the validated data.
        """
        instance.user_id = validated_data.get('user_id', instance.user_id)
        instance.timestamp = validated_data.get('timestamp', instance.timestamp)
        instance.duration = validated_data.get('duration', instance.duration)
        instance.distance = validated_data.get('distance', instance.distance)
        instance.save()
        return instance
