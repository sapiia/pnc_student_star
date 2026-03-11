import pandas as pd

data = {
    'First Name': ['John', 'Jane'],
    'Last Name': ['Doe', 'Smith'],
    'Email Address': ['john.doe@example.com', 'jane.smith@example.com'],
    'Gender (Male/Female/Other)': ['Male', 'Female'],
    'Role (Student/Teacher/Admin)': ['Student', 'Teacher'],
    'Generation (e.g., 2026)': ['2026', ''],
    'Class (e.g., A)': ['WEB A', ''],
    'Student ID (Format: YYYY-XXX)': ['2026-001', ''],
    'Major': ['SNA', '']
}

df = pd.DataFrame(data)
df.to_excel('test_invite.xlsx', index=False)
