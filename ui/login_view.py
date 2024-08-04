import customtkinter as ctk
from tkinter import messagebox
from client.account_manager import AccountManager
from ui.toast_view import show_toast
from ui.fonts import FONTS

class LoginView(ctk.CTkFrame):
    def __init__(self, master):
        super().__init__(master)

        # Título de la vista
        self.label = ctk.CTkLabel(self, text="Login to XMPP", font=FONTS["TITLE"])
        self.label.pack(pady=20)

        # Campo para ingresar el nombre de usuario
        self.username_entry = ctk.CTkEntry(self, placeholder_text="Username", font=FONTS["TEXT"])
        self.username_entry.pack(pady=10)

        # Campo para ingresar la contraseña
        self.password_entry = ctk.CTkEntry(self, placeholder_text="Password", show="*", font=FONTS["TEXT"])
        self.password_entry.pack(pady=10)

        # Botón de inicio de sesión
        self.login_button = ctk.CTkButton(self, text="Login", command=self.login, font=FONTS["BUTTON"])
        self.login_button.pack(pady=10)

        # Botón para regresar al menú principal
        self.back_button = ctk.CTkButton(self, text="Back", command=self.go_back, font=FONTS["BUTTON"])
        self.back_button.pack(pady=10)

    def login(self):
        """Intentar iniciar sesión con las credenciales ingresadas."""
        username = self.username_entry.get()
        password = self.password_entry.get()

        if username and password:
            account_manager = AccountManager()
            success = account_manager.login(username, password)
            if success:
                show_toast(self.master, "Logged in successfully!")
                # Aquí podrías cambiar a la vista principal de la app o al chat
            else:
                show_toast(self.master, "Login failed. Please check your credentials.")
        else:
            show_toast(self.master, "Please enter both username and password.")

    def go_back(self):
        """Volver al menú principal."""
        from ui.main_view import MainView
        main_view = MainView(self.master)
        self.master.change_view(main_view)
