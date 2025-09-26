import logging
import os
from logging.handlers import RotatingFileHandler



def setup_logger(name: str) -> logging.Logger:
    """
    Setup logger with consistent configuration.
    Returns configured logger instance.
    """
    logger = logging.getLogger(name)
    if logger.handlers:  # Already configured
        return logger
        
    logger.setLevel(logging.INFO)
    
    # Create logs directory if it doesn't exist
    os.makedirs("logs", exist_ok=True)
    
    # Create formatter
    formatter = logging.Formatter(
        '%(asctime)s - %(name)s - %(levelname)s - %(funcName)s:%(lineno)d - %(message)s'
    )
    
    # Create file handler with rotation (10MB max, keep 5 files)
    file_handler = RotatingFileHandler(
        filename=os.path.join("logs", "supervisor.log"),
        maxBytes=10 * 1024 * 1024,  # 10MB
        backupCount=5,
        encoding='utf-8'
    )
    file_handler.setLevel(logging.INFO)
    file_handler.setFormatter(formatter)
    
    # Create console handler
    console_handler = logging.StreamHandler()
    console_handler.setLevel(logging.INFO)
    console_handler.setFormatter(formatter)
    
    # Add handlers to logger
    logger.addHandler(file_handler)
    logger.addHandler(console_handler)
    
    return logger
