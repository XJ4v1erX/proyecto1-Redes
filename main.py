import customtkinter as ctk
from ui.main_view import MainView

# Configurar el tema y las opciones de la interfaz
ctk.set_appearance_mode("System")  # Modo de apariencia (System, Dark, Light)
ctk.set_default_color_theme("blue")  # Tema de color (blue, green, dark-blue)

class XMPPClientApp(ctk.CTk):
    def __init__(self):
        super().__init__()

        # Configuración de la ventana principal
        self.title(" Rami XMPP Client")
        self.geometry("750x400")

        # Variable para guardar la vista actual
        self.current_view = None

        # Inicializar la vista principal (main menu)
        self.main_view = MainView(self)
        self.change_view(self.main_view)

    def change_view(self, view):
        """Cambiar entre las diferentes vistas de la aplicación."""
        if self.current_view is not None:
            self.current_view.pack_forget()  # Esconde la vista actual sin destruirla

        self.current_view = view
        self.current_view.pack(fill="both", expand=True)

# Función principal para iniciar la aplicación
def initialize_app():
    app = XMPPClientApp()
    app.mainloop()

if __name__ == "__main__":
    initialize_app()
