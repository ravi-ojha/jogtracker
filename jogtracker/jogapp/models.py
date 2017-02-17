"""
Jogging App Models
"""
from django.contrib.auth.models import User
from django.db import models

class Jog(models.Model):
    """
    Model to store information about the jogging session of any user

    Attributes:

        user (User object FK) - User who created the object
        timestamp (date) - Date and Time of creation of object
        duration (int) - Duration in seconds
        distance (int) - Distance in meters

        We store duration and distance in int datatype because
         - It will easy to later show this data in kms or miles
         - Also average_speed property can be shown either in kmph or mph

    """
    # User who created this jogging entry
    user = models.ForeignKey(User, related_name='jogs')
    # Date and Time of the jogging session
    timestamp = models.DateTimeField()
    # Time taken by the user for the jogging session in seconds
    duration = models.IntegerField()
    # Distance traveled by user during the jogging session in meters
    distance = models.IntegerField()

    @property
    def average_speed(self):
        """
        Returns average speed (float) of the jogging session

        Future Scope of improvement:

         - If users can have a setting of either showing data in kmph or mph
         - Depending on that setting we can modify the property to return
           data in preferred format
        """
        # Distance in kms
        distance_kms = self.distance/1000.0
        # Duration in hours
        duration_hrs = self.duration/3600.0
        # Returns average speed in kmph
        return distance_kms/duration_hrs
