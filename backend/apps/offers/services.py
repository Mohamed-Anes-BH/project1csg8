"""Services for offers app"""


def is_visible_for_student(offer, student):
    """
    CRITICAL: Determine if offer is visible for student
    Based on targeted universities and required specialties
    """
    # Implementation will check:
    # - student.university in offer.targeted_universities
    # - student.specialty in offer.required_specialties
    pass


def calculate_match_score(offer, student):
    """
    BONUS: Calculate compatibility score between offer and student
    """
    pass


def send_offer_expiration_alert(offer):
    """Send alert when offer is about to expire"""
    pass
