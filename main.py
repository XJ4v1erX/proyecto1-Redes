import tkinter as tk
from ui.main_view import MainView
from ui.login_view import LoginView
from ui.register_view import RegisterView
from ui.chat_view import ChatView

class Application:
    def __init__(self):
        self.root = tk.Tk()
        self.show_main_view()

    def show_main_view(self):
        self.clear_root()
        MainView(self.root, on_login=self.show_login_view, on_register=self.show_register_view)

    def show_login_view(self):
        self.clear_root()
        LoginView(self.root, on_login_success=self.show_chat_view, on_back=self.show_main_view)

    def show_register_view(self):
        self.clear_root()
        RegisterView(self.root, on_register_success=self.show_login_view, on_back=self.show_main_view)

    def show_chat_view(self, jid):
        self.clear_root()
        chat_manager = None  # Aquí deberías inicializar tu ChatManager
        ChatView(self.root, jid, chat_manager)

    def clear_root(self):
        for widget in self.root.winfo_children():
            widget.destroy()

    def run(self):
        self.root.mainloop()

if __name__ == "__main__":
    app = Application()
    app.run()
