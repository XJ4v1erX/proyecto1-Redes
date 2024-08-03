import customtkinter as ctk

def show_toast(root, message, duration=2000):
    """Muestra un mensaje tipo 'toast' en una ventana flotante."""
    toast = ctk.CTkToplevel(root)  # Crear una pequeña ventana flotante
    toast.overrideredirect(True)  # Quitar bordes de la ventana
    toast.geometry(f"300x50+{root.winfo_x() + 160}+{root.winfo_y() + root.winfo_height() - 100}")  # Posicionarlo
    toast_label = ctk.CTkLabel(toast, text=message, font=("Arial", 12))
    toast_label.pack(padx=20, pady=10)
    
    # Destruir la ventana automáticamente después de 'duration' milisegundos
    toast.after(duration, toast.destroy)
