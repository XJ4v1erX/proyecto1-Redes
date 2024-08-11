import tkinter as tk
from tkinter import ttk
from tkinter import scrolledtext

class ChatView:
    def __init__(self, root, jid, chat_manager):
        self.root = root
        self.jid = jid  # El JID del contacto con quien estás chateando
        self.chat_manager = chat_manager  # Instancia del ChatManager
        self.root.title(f"Chat with {jid}")
        self.root.geometry("800x600")

        # Crear el marco principal
        self.main_frame = tk.Frame(self.root)
        self.main_frame.pack(fill=tk.BOTH, expand=True)

        # Panel de la izquierda (Lista de contactos)
        self.left_panel = tk.Frame(self.main_frame, width=200)
        self.left_panel.pack(side=tk.LEFT, fill=tk.Y)

        # Título para contactos
        self.contacts_label = tk.Label(self.left_panel, text="Contactos", font=("Arial", 12))
        self.contacts_label.pack(pady=10)

        # Botón para agregar contacto
        self.add_contact_button = ttk.Button(self.left_panel, text="Agregar contacto")
        self.add_contact_button.pack(pady=5)

        # Lista de contactos
        self.contacts_list = tk.Listbox(self.left_panel)
        self.contacts_list.pack(pady=5, fill=tk.BOTH, expand=True)

        # Grupos
        self.groups_label = tk.Label(self.left_panel, text="Grupos", font=("Arial", 12))
        self.groups_label.pack(pady=10)

        self.join_group_button = ttk.Button(self.left_panel, text="Unirse a un grupo")
        self.join_group_button.pack(pady=5)

        # Solicitudes de amistad
        self.friend_requests_label = tk.Label(self.left_panel, text="Solicitudes de amistad", font=("Arial", 12))
        self.friend_requests_label.pack(pady=10)

        # Status y botones de acción
        self.status_label = tk.Label(self.left_panel, text="Status: Conectado")
        self.status_label.pack(pady=10)

        self.logout_button = tk.Button(self.left_panel, text="Log out")
        self.logout_button.pack(pady=5)

        self.delete_account_button = tk.Button(self.left_panel, text="Delete Account")
        self.delete_account_button.pack(pady=5 )

        # Panel de la derecha (Área de chat)
        self.chat_panel = tk.Frame(self.main_frame)
        self.chat_panel.pack(side=tk.RIGHT, fill=tk.BOTH, expand=True)

        # Área de mensajes (scrollable)
        self.chat_display = scrolledtext.ScrolledText(self.chat_panel, state=tk.DISABLED, wrap=tk.WORD, height=20)
        self.chat_display.pack(pady=10, padx=10, fill=tk.BOTH, expand=True)

        # Input para enviar mensaje
        self.message_entry = tk.Entry(self.chat_panel, width=80)
        self.message_entry.pack(side=tk.LEFT, padx=10, pady=10)

        # Botón de enviar mensaje
        self.send_button = ttk.Button(self.chat_panel, text="Send", command=self.send_message)
        self.send_button.pack(side=tk.LEFT, padx=5, pady=10)

        # Botón para subir archivo
        self.upload_button = ttk.Button(self.chat_panel, text="Subir archivo")
        self.upload_button.pack(side=tk.LEFT, padx=5, pady=10)

    def send_message(self):
        message = self.message_entry.get()
        if message:
            self.chat_display.config(state=tk.NORMAL)
            self.chat_display.insert(tk.END, f"Tú: {message}\n")
            self.chat_display.config(state=tk.DISABLED)
            self.message_entry.delete(0, tk.END)
            self.chat_manager.send_message(self.jid, message)
