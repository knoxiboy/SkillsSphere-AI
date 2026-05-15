import os
from faster_whisper import WhisperModel

# Load model once at startup — "base" is a good balance of speed and accuracy
# Options: "tiny", "base", "small", "medium", "large-v3"
# Use "tiny" for faster development, "base" or "small" for production
MODEL_SIZE = os.getenv("WHISPER_MODEL_SIZE", "base")

print(f"[whisper] Loading faster-whisper model: {MODEL_SIZE}")
model = WhisperModel(MODEL_SIZE, device="cpu", compute_type="int8")
print(f"[whisper] Model loaded successfully")


def transcribe_audio(audio_path: str) -> str:
    """
    Transcribe an audio file to text using faster-whisper.

    Args:
        audio_path: Path to the audio file on disk.

    Returns:
        The full transcribed text as a single string.
    """
    segments, info = model.transcribe(audio_path, beam_size=5)

    print(
        f"[whisper] Detected language: {info.language} (probability: {info.language_probability:.2f})"
    )

    # Combine all segments into a single transcript
    transcript = " ".join(segment.text.strip() for segment in segments)

    if not transcript:
        return ""

    print(f"[whisper] Transcribed {len(transcript)} characters")
    return transcript
