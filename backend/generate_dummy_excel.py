import pandas as pd

data = {
    'Domaine': ['Informatique', 'Informatique', 'Biologie', 'Biologie'],
    'Spécialité': ['Data Science', 'Cyber Security', 'Génétique', 'Microbiologie']
}

df = pd.DataFrame(data)
df.to_excel('referential.xlsx', index=False)
print("referential.xlsx created.")
