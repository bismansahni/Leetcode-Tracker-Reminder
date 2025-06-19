import os
import requests

def send_email(results):
    service_id = os.getenv("EMAILJS_SERVICE_ID")
    template_id = os.getenv("EMAILJS_TEMPLATE_ID")
    user_id = os.getenv("EMAILJS_USER_ID")
    private_key = os.getenv("EMAILJS_PRIVATE_KEY")

    print("📌 Email payload input:", results)

    
    if len(results) < 2:
        print("❌ Not enough questions to send.")
        return

    
    (first_question_id, first_question_url) = results[0]
    (second_question_id, second_question_url) = results[1]

   
    template_params = {
        "to_email": "bismansahni@outlook.com",
        "subject": "Your Random Questions",
        "first_question_id": first_question_id,
        "first_question_url": first_question_url,
        "second_question_id": second_question_id,
        "second_question_url": second_question_url,
       
    }

    payload = {
        "service_id": service_id,
        "template_id": template_id,
        "user_id": user_id,
        "template_params": template_params
    }

    try:
        response = requests.post(
            "https://api.emailjs.com/api/v1.0/email/send",
            headers={
                "Content-Type": "application/json",
                "Authorization": f"Bearer {private_key}"
            },
            json=payload
        )

        response.raise_for_status()
        print("✅ Email sent successfully")

    except requests.exceptions.RequestException as e:
        print(f"❌ Failed to send email: {e}")
