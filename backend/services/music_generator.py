import scipy
import os
import tempfile
from config import get_settings


class MusicGenerator:
    _instance = None
    _processor = None
    _model = None
    _loading = False
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(MusicGenerator, cls).__new__(cls)
        return cls._instance
    
    def _ensure_loaded(self):
        if self._processor is not None and self._model is not None:
            return
        
        if self._loading:
            return
        
        self._loading = True
        
        try:
            try:
                from transformers import AutoProcessor, MusicgenForConditionalGeneration
                has_transformers = True
            except ImportError:
                has_transformers = False
                print("WARNING: transformers not installed. Install with: pip install -r requirements-ml.txt")
            
            if not has_transformers:
                self._processor = "mock"
                self._model = "mock"
                print("Using MOCK mode - no actual music will be generated!")
                return
            
            settings = get_settings()
            os.environ['HF_HOME'] = settings.hf_home
            
            print("Loading MusicGen model (this may take a while on first run)...")
            self._processor = AutoProcessor.from_pretrained("facebook/musicgen-small")
            self._model = MusicgenForConditionalGeneration.from_pretrained("facebook/musicgen-small")
            print("Model loaded successfully!")
        finally:
            self._loading = False
    
    def generate(self, prompt: str, max_tokens: int) -> str:
        self._ensure_loaded()
        
        if self._processor == "mock" or self._model == "mock":
            return self._generate_mock(prompt, max_tokens)
        
        inputs = self._processor(
            text=[prompt],
            padding=True,
            return_tensors="pt",
        )
        
        audio_values = self._model.generate(**inputs, max_new_tokens=max_tokens)
        
        sampling_rate = self._model.config.audio_encoder.sampling_rate
        
        with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as tmp_file:
            scipy.io.wavfile.write(
                tmp_file.name,
                rate=sampling_rate,
                data=audio_values[0, 0].numpy()
            )
            return tmp_file.name
    
    def _generate_mock(self, prompt: str, max_tokens: int) -> str:
        import numpy as np
        
        duration = max_tokens / 50.0
        sample_rate = 32000
        samples = int(sample_rate * duration)
        
        t = np.linspace(0, duration, samples)
        frequency = 440.0
        audio = np.sin(2 * np.pi * frequency * t) * 0.3
        audio = (audio * 32767).astype(np.int16)
        
        with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as tmp_file:
            scipy.io.wavfile.write(
                tmp_file.name,
                rate=sample_rate,
                data=audio
            )
            return tmp_file.name
