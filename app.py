from flask import Flask, request, jsonify, render_template, redirect, url_for
from slixmpp import ClientXMPP

app = Flask(__name__)

class XMPPClient(ClientXMPP):
    def __init__(self, jid, password):
        super().__init__(jid, password)
        self.add_event_handler("session_start", self.session_start)
        self.add_event_handler("message", self.message)

    def session_start(self, event):
        self.send_presence()
        self.get_roster()

    def message(self, msg):
        if msg['type'] in ('chat', 'normal'):
            print(f"Received message: {msg['body']}")

# Página principal con botones para registrar o iniciar sesión
@app.route('/')
def index():
    return render_template('index.html')

# Registrar cuenta
@app.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        # Implementar lógica de registro usando el servidor XMPP
        return redirect(url_for('chat'))  # Redirigir a la ventana de chat después de registrar
    return render_template('register.html')

# Iniciar sesión
@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        # Extraer el JID y password de la solicitud
        data = request.form
        jid = data.get('jid')
        password = data.get('password')

        # Iniciar sesión en XMPP
        xmpp = XMPPClient(jid, password)
        xmpp.connect()
        xmpp.process(forever=False)

        return redirect(url_for('chat'))  # Redirigir a la ventana de chat después de iniciar sesión
    return render_template('login.html')

# Ventana de chat
@app.route('/chat')
def chat():
    return render_template('chat.html')

if __name__ == '__main__':
    app.run(debug=True)
