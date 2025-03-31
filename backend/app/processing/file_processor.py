import os
import pandas as pd
import numpy as np
from typing import Dict, Any, Optional
import json
import scipy.io as sio
import h5py

def validate_file_type(filename: str) -> bool:
    """Validate if the file type is supported."""
    valid_extensions = ['.csv', '.xlsx', '.mat', '.h5']
    file_ext = os.path.splitext(filename)[1].lower()
    return file_ext in valid_extensions

def process_file(file_path: str) -> Dict[str, Any]:
    """Process uploaded file and extract metadata."""
    file_ext = os.path.splitext(file_path)[1].lower()
    
    metadata = {
        "columns": [],
        "rows": 0,
        "data_type": None,
        "frequency_range": None,
        "channels": []
    }
    
    try:
        if file_ext == '.csv':
            metadata = process_csv(file_path)
        elif file_ext == '.xlsx':
            metadata = process_excel(file_path)
        elif file_ext == '.mat':
            metadata = process_matlab(file_path)
        elif file_ext == '.h5':
            metadata = process_hdf5(file_path)
    except Exception as e:
        raise ValueError(f"Error processing file: {str(e)}")
    
    return metadata

def process_csv(file_path: str) -> Dict[str, Any]:
    """Process CSV file and extract metadata."""
    df = pd.read_csv(file_path, nrows=5)  # Read first few rows to get structure
    
    metadata = {
        "columns": df.columns.tolist(),
        "rows": len(pd.read_csv(file_path, usecols=[0])),  # Count rows efficiently
        "data_type": "time_domain" if "time" in df.columns else "frequency_domain",
        "frequency_range": None,
        "channels": []
    }
    
    # Try to detect frequency range if it's frequency domain data
    if metadata["data_type"] == "frequency_domain" and "frequency" in df.columns:
        freq_col = df["frequency"]
        metadata["frequency_range"] = {
            "min": float(freq_col.min()),
            "max": float(freq_col.max())
        }
    
    # Detect channels
    for col in df.columns:
        if col not in ["time", "frequency"]:
            metadata["channels"].append({
                "name": col,
                "type": detect_channel_type(col)
            })
    
    return metadata

def process_excel(file_path: str) -> Dict[str, Any]:
    """Process Excel file and extract metadata."""
    # Read first sheet by default
    df = pd.read_excel(file_path, nrows=5)
    
    metadata = {
        "columns": df.columns.tolist(),
        "rows": len(pd.read_excel(file_path, usecols=[0])),
        "sheets": pd.ExcelFile(file_path).sheet_names,
        "data_type": "time_domain" if "time" in df.columns else "frequency_domain",
        "frequency_range": None,
        "channels": []
    }
    
    # Try to detect frequency range if it's frequency domain data
    if metadata["data_type"] == "frequency_domain" and "frequency" in df.columns:
        freq_col = df["frequency"]
        metadata["frequency_range"] = {
            "min": float(freq_col.min()),
            "max": float(freq_col.max())
        }
    
    # Detect channels
    for col in df.columns:
        if col not in ["time", "frequency"]:
            metadata["channels"].append({
                "name": col,
                "type": detect_channel_type(col)
            })
    
    return metadata

def process_matlab(file_path: str) -> Dict[str, Any]:
    """Process MATLAB file and extract metadata."""
    try:
        # Try loading with scipy.io
        mat_data = sio.loadmat(file_path)
        keys = list(mat_data.keys())
        # Filter out default MATLAB variables
        keys = [k for k in keys if not k.startswith('__')]
        
        metadata = {
            "variables": keys,
            "data_type": "unknown",
            "matrices": []
        }
        
        # Check for common TPA matrices
        for key in keys:
            if key in mat_data:
                shape = mat_data[key].shape
                metadata["matrices"].append({
                    "name": key,
                    "shape": shape
                })
                
                # Try to detect if it's FRF data
                if "frf" in key.lower() or "h" == key.lower():
                    metadata["data_type"] = "frequency_response_function"
                # Try to detect if it's time domain data
                elif "time" in key.lower() or "t" == key.lower():
                    metadata["data_type"] = "time_domain"
                # Try to detect if it's frequency domain data
                elif "freq" in key.lower() or "f" == key.lower():
                    metadata["data_type"] = "frequency_domain"
        
    except:
        # If scipy.io fails, try h5py for MATLAB v7.3 files
        try:
            with h5py.File(file_path, 'r') as f:
                keys = list(f.keys())
                
                metadata = {
                    "variables": keys,
                    "data_type": "unknown",
                    "matrices": []
                }
                
                for key in keys:
                    if key in f:
                        shape = f[key].shape
                        metadata["matrices"].append({
                            "name": key,
                            "shape": shape
                        })
        except:
            raise ValueError("Unable to read MATLAB file format")
    
    return metadata

def process_hdf5(file_path: str) -> Dict[str, Any]:
    """Process HDF5 file and extract metadata."""
    with h5py.File(file_path, 'r') as f:
        keys = list(f.keys())
        
        metadata = {
            "groups": [],
            "datasets": []
        }
        
        # Function to recursively explore HDF5 structure
        def explore_group(group, path=""):
            for key in group:
                item_path = f"{path}/{key}" if path else key
                if isinstance(group[key], h5py.Group):
                    metadata["groups"].append(item_path)
                    explore_group(group[key], item_path)
                elif isinstance(group[key], h5py.Dataset):
                    metadata["datasets"].append({
                        "name": item_path,
                        "shape": group[key].shape,
                        "dtype": str(group[key].dtype)
                    })
        
        explore_group(f)
    
    return metadata

def detect_channel_type(channel_name: str) -> str:
    """Detect the type of channel based on its name."""
    channel_name = channel_name.lower()
    
    if any(acc in channel_name for acc in ["acc", "accel", "acceleration"]):
        return "accelerometer"
    elif any(mic in channel_name for mic in ["mic", "microphone", "spl"]):
        return "microphone"
    elif any(force in channel_name for force in ["force", "load"]):
        return "force"
    elif any(disp in channel_name for disp in ["disp", "displacement"]):
        return "displacement"
    elif any(vel in channel_name for vel in ["vel", "velocity"]):
        return "velocity"
    else:
        return "unknown"

