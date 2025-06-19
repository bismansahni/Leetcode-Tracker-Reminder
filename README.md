# 🚀 LeetCode Tracker & Reminder System

A fully automated system that **tracks your accepted LeetCode submissions**, **stores them in a PostgreSQL database**, and **emails you two random revision questions daily**, prioritizing those you’ve revised the least. Built with **Flask**, **PostgreSQL**, **EmailJS**, and **Render for deployment**.

---

## 📌 Features

- ✅ Tracks **recently solved LeetCode questions** using GraphQL
- 🧠 Stores and updates submission data in a **PostgreSQL database**
- 🔁 Automatically selects **2 questions daily** with the **least number of revisions**
- ✉️ Sends a **daily email** with selected questions using **EmailJS API**
- 🔐 Secured with a **token-based GET endpoint** to prevent unauthorized access
- 🛠️ Production-ready with **Gunicorn**, and **deployed on Render**

---

## 💡 Use Case

Perfect for students and professionals preparing for technical interviews who want to **revise solved LeetCode questions smartly and follow spaced revision**.

---

## 🛠️ Tech Stack

| Layer         | Tech                                 |
|--------------|--------------------------------------|
| Backend       | Python, Flask                        |
| DB            | PostgreSQL                           |
| Scheduler     | Auto CRON (or Render Cron Jobs)    |
| API           | LeetCode GraphQL API                 |
| Email Service | EmailJS (JS-based email API)         |
| Hosting       | Render                               |

---

## 🔧 Project Structure

```
leetcode-tracker-reminder/
│
├── controllers/
│   ├── fetchQuestion.py         # Fetches 2 questions with min revision count
│   ├── sendEmail.py             # Sends formatted emails via EmailJS
│   └── DailyDbupdate.py         # Fetches latest AC submissions from LeetCode
|   └── questionCommit.py.       # Increases revision count 
│
├── main.py                      # Flask app entry point with protected GET endpoint
├── requirements.txt             # Python dependencies
├── README.md                    # This file
├── .env                         # Secrets (not committed)
└── wsgi.py                      # Entry point for Gunicorn (production)
```

---

## 🔒 Secured Endpoint

You can hit this URL securely using a GET request with your token:

```
https://<your-domain>/HitMain?token=YOUR_SECRET_TOKEN
```

---

## 📬 Email Output (Sample)

```
Subject: Your Random Questions

Hello Bisman,

Here are your two randomly selected LeetCode questions for today:

1. https://leetcode.com/problems/add-two-numbers/ (ID: 28)
2. https://leetcode.com/problems/removing-stars-from-a-string/ (ID: 65)


```

---

## 📦 Installation

```bash
git clone https://github.com/yourusername/leetcode-tracker-reminder.git
cd leetcode-tracker-reminder
python -m venv env
source env/bin/activate
pip install -r requirements.txt
```

Create a `.env` file with:

```env
DATABASE_URL=your_postgres_url
EMAILJS_SERVICE_ID=your_service_id
EMAILJS_TEMPLATE_ID=your_template_id
EMAILJS_USER_ID=your_user_id
EMAILJS_PRIVATE_KEY=your_private_key
SECRET_TOKEN=your_secret_token
```

---

## 🧪 Development

```bash
export FLASK_APP=main.py
flask run
```

---

## 🚀 Production (Gunicorn)

```bash
gunicorn -w 4 -b 0.0.0.0:8080 main:app
```

---



## 📄 License

This project is open-source and free to use under the [MIT License](LICENSE).
