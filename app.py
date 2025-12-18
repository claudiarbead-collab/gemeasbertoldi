import streamlit as st
import google.generativeai as genai

# 1. Configuração da API - Ele vai buscar o valor que você salvou nos Secrets do Streamlit
genai.configure(api_key=st.secrets["AIzaSyB7f_9kHb6m4bVQFZvZHdw4g1ET0j280S8"])

# 2. Configuração do seu "App"
# SUBSTITUA O TEXTO ABAIXO PELO SEU PROMPT REAL DO AI STUDIO
SYSTEM_PROMPT = "Você é um assistente especializado em..."

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
    # Adiciona mensagem do usuário
    st.session_state.messages.append({"role": "user", "content": prompt})
    with st.chat_message("user"):
        st.markdown(prompt)

    # Gera e adiciona resposta da IA
    with st.chat_message("assistant"):
        response = model.generate_content(prompt)
        st.markdown(response.text)
        st.session_state.messages.append({"role": "assistant", "content": response.text})
