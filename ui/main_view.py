import customtkinter as ctk
from ui.fonts import FONTS

class MainView(ctk.CTkFrame):
    def __init__(self, master):
        super().__init__(master)

        # Espaciador inicial para que los elementos empiecen más abajo
        self.spacer = ctk.CTkLabel(self, text="")  # Un espaciador vacío
        self.spacer.pack(pady=20)  # Espaciador de 50 píxeles

        # Título principal de la aplicación
        self.label = ctk.CTkLabel(self, text="XMPP Client", font=FONTS["TITLE"])
        self.label.pack(pady=7)

        # Botón para iniciar sesión
        self.login_button = ctk.CTkButton(self, text="Login", command=self.open_login, font=FONTS["BUTTON"])
        self.login_button.pack(pady=5)  # Aumentar el padding vertical

        # Botón para registrar una nueva cuenta
        self.register_button = ctk.CTkButton(self, text="Register", command=self.open_register, font=FONTS["BUTTON"])
        self.register_button.pack(pady=5)  # Aumentar el padding vertical

        # Botón para cerrar la aplicación
        self.exit_button = ctk.CTkButton(self, text="Exit", command=self.exit_app, font=FONTS["BUTTON"])
        self.exit_button.pack(pady=5)  # Aumentar el padding vertical

    def open_login(self):
        """Cambiar a la vista de inicio de sesión."""
        from ui.login_view import LoginView
        login_view = LoginView(self.master)
        self.master.change_view(login_view)

    def open_register(self):
        """Cambiar a la vista de registro de cuenta."""
        # from ui.register_view import RegisterView
        # register_view = RegisterView(self.master)
        # self.master.change_view(register_view)

    def exit_app(self):
        """Cerrar la aplicación."""
        self.master.destroy()
