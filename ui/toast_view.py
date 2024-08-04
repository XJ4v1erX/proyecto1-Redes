import customtkinter as ctk
from ui.fonts import FONTS

def show_toast(root, message, duration=2000):
    """Muestra un mensaje tipo 'toast' en una ventana flotante, ajustado en la esquina superior derecha."""
    toast = ctk.CTkToplevel(root)  # Crear una pequeña ventana flotante
    toast.overrideredirect(True)  # Quitar bordes de la ventana

    # Tamaño del toast
    width, height = 300, 40  # Ancho y alto del toast

    # Obtener el tamaño y posición de la ventana principal
    root_width = root.winfo_width()
    root_x = root.winfo_x()
    root_y = root.winfo_y()

    # Calcular la posición para que el toast esté en la esquina superior derecha, dentro de la ventana
    x = root_x + root_width - width + 5  # Margen de 5 píxeles desde el borde derecho
    y = root_y + 35  # Margen de 30 píxeles desde la parte superior

    # Aplicar la posición calculada al toast
    toast.geometry(f"{width}x{height}+{x}+{y}")

    # Configurar el label dentro del toast con la fuente TOAST
    toast_label = ctk.CTkLabel(toast, text=message, font=FONTS["TOAST"] )
    toast_label.pack(padx=10, pady=5)
    
    # Destruir la ventana automáticamente después de 'duration' milisegundos
    toast.after(duration, toast.destroy)
