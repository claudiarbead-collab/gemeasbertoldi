import streamlit as st
import google.generativeai as genai

# 1. Configuração da API usando o Segredo que você criou no Streamlit
# Certifique-se que lá nos Secrets você escreveu exatamente: GOOGLE_API_KEY = "AIzaSyB7f_9kHb6m4bVQFZvZHdw4g1ET0j280S8"
genai.configure(api_key=st.secrets["GOOGLE_API_KEY"])

# 2. Configuração do seu "App" (O código que você quer esconder)
SYSTEM_PROMPT = """
COLE AQUI O SEU SYSTEM PROMPT DO GOOGLE AI STUDIO
"""

model = genai.GenerativeModel(
    model_name="gemini-1.5-flash",
    system_instruction=SYSTEM_PROMPT
)

# 3. Interface do site
st.title("🤖 Meu App Privado")

if "messages" not in st.session_state:
    st.session_state.messages = []

for message in st.session_state.messages:
    with st.chat_message(message["role"]):
        st.markdown(message["content"])

if prompt := st.chat_input("Como posso ajudar?"):
    st.session_state.messages.append({"role": "user", "content": prompt})
    with st.chat_message("user"):
        st.markdown(prompt)

    with st.chat_message("assistant"):
        response = model.generate_content(prompt)
        st.markdown(response.text)
        st.session_state.messages.append({"role": "assistant", "content": response.text})
