import google.generativeai as genai
import os
import time
import json
import re
from dotenv import load_dotenv

load_dotenv()

DATA_DIR = os.path.join(os.path.dirname(__file__), "data")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)
else:
    print("Warning: GEMINI_API_KEY not found in environment variables.")

def clean_json_string(json_str):
    """Clean markdown code blocks from string to extract JSON."""
    if "```json" in json_str:
        json_str = json_str.split("```json")[1].split("```")[0]
    elif "```" in json_str:
        json_str = json_str.split("```")[1].split("```")[0]
    return json_str.strip()

# assume beats are a list of details
def generate_beat_details(beats, chapter_data, api_key=None):
    list_of_details = []
    previous_beat = None
    
    # Ensure beats is a list
    if isinstance(beats, str):
        try:
            beats = json.loads(clean_json_string(beats))
        except json.JSONDecodeError:
            print("Failed to parse beats JSON")
            return []
            
    if not isinstance(beats, list):
        print(f"Beats is not a list: {type(beats)}")
        return []

    print(f"Generating details for {len(beats)} beats...")

    for i, beat in enumerate(beats):
        current_beat = beat
        next_beat = beats[i+1] if i < len(beats) - 1 else None
        
        print(f"Processing beat {i+1}/{len(beats)}")

        # Extract variables
        if isinstance(chapter_data, str):
             try:
                chapter_data = json.loads(chapter_data)
             except:
                pass # Handle as dict or fail later

        characters = chapter_data.get("characters", ["Diluc", "Kaeya"])
        start_setting = chapter_data.get("start_setting", "Angel's Share")
        story_direction = chapter_data.get("story_direction", "")

        
        system_instructions = r"""
        **Role:** You are a descriptive novelist and scene director. Your task is to expand a single key event ("beat") into a detailed and immersive narrative segment.

        **Objective:** Flesh out the `current_beat_outline` into a full narrative segment. Your description must:

        1. **Transition from the Previous:** Use the `previous_beat_output` as your starting point. Ensure a smooth continuation of action, mood, and character positioning.
        2. **Detail the Current:** Fully realize the `Key_Event` of the `current_beat_outline`. Describe the sensory details, specific actions, and internal feelings.
        3. **Foreshadow the Next:** Look at the `next_beat_outline` and subtly set the stage for it.

        **IMPORTANT:** Do not write any dialogue yet unless explicitly required by the beat. Focus on building the scene and emotional subtext.

        **Output Format:** Return ONLY a JSON object:
        { "output_segment": "Your detailed narrative description for this beat goes here." }
        """

        input_prompt = f"""
        {system_instructions}
        
        Characters: {characters}
        Setting: {start_setting}
        Initial Story Direction: {story_direction}
        Previous Beat: {previous_beat}
        Current Beat: {current_beat}
        Next Beat: {next_beat}
        """

        generation_config = {
            "max_output_tokens": 2048,
            "temperature": 1,
            "top_p": 0.95,
        }

        safety_settings = [
            {
                "category": "HARM_CATEGORY_HATE_SPEECH",
                "threshold": "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
                "category": "HARM_CATEGORY_DANGEROUS_CONTENT",
                "threshold": "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
                "category": "HARM_CATEGORY_SEXUALLY_EXPLICIT",
                "threshold": "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
                "category": "HARM_CATEGORY_HARASSMENT",
                "threshold": "BLOCK_MEDIUM_AND_ABOVE"
            },
        ]
        
        if api_key:
            genai.configure(api_key=api_key)
        
        model = genai.GenerativeModel("gemini-2.5-flash-lite")
        
        try:
            responses = model.generate_content(
                input_prompt,
                generation_config=generation_config,
                safety_settings=safety_settings,
            )
            
            response_text = responses.text
            cleaned_json = clean_json_string(response_text)
            segment_json = json.loads(cleaned_json)
            
            # Add metadata to the segment
            segment_json["beat_index"] = i
            segment_json["location"] = beat.get("location", "")
            segment_json["characters"] = beat.get("Characters", [])
            
            list_of_details.append(segment_json)
            previous_beat = segment_json.get("output_segment", "")
            
        except Exception as e:
            print(f"Error generating beat {i}: {e}")
            list_of_details.append({
                "output_segment": f"Error generating segment for beat {i}.",
                "beat_index": i
            })

    return list_of_details

def generate_beats(chapter_data, api_key=None):
    print("Generating beats...")
    
    if isinstance(chapter_data, str):
        try:
            chapter_data = json.loads(chapter_data)
        except:
            pass

    characters = chapter_data.get("characters", ["Diluc", "Kaeya"])
    start_setting = chapter_data.get("start_setting", "Angel's Share")
    story_direction = chapter_data.get("story_direction", "")

    system_instructions = r"""
    You are a playwright tasked with writing a dramatic chapter in play format.
    Your task:  
    Generate a high-level scene outline for this chapter. Structure it as a list of multiple numbered beats. 
    Each beat should include the location, characters involved, and the key event/tension.
    
    Return a JSON LIST of objects in this format:
    [
        {
            "location": "Location Name",
            "Characters": ["Char1", "Char2"],
            "Key_Event": "Description of what happens"
        }
    ]
    """

    input_prompt = f"""
    {system_instructions}
    
    * **Characters:** {characters}
    * **Setting:** {start_setting}
    * **Initial Story Direction:**
    {story_direction}
    """

    generation_config = {
        "max_output_tokens": 2048,
        "temperature": 1,
        "top_p": 0.95,
    }

    safety_settings = [
        {
            "category": "HARM_CATEGORY_HATE_SPEECH",
            "threshold": "BLOCK_MEDIUM_AND_ABOVE"
        },
        {
            "category": "HARM_CATEGORY_DANGEROUS_CONTENT",
            "threshold": "BLOCK_MEDIUM_AND_ABOVE"
        },
        {
            "category": "HARM_CATEGORY_SEXUALLY_EXPLICIT",
            "threshold": "BLOCK_MEDIUM_AND_ABOVE"
        },
        {
            "category": "HARM_CATEGORY_HARASSMENT",
            "threshold": "BLOCK_MEDIUM_AND_ABOVE"
        },
    ]
    
    if api_key:
        genai.configure(api_key=api_key)

    model = genai.GenerativeModel("gemini-2.5-flash-lite")
    
    try:
        responses = model.generate_content(
            input_prompt,
            generation_config=generation_config,
            safety_settings=safety_settings,
        )
        return responses.text
    except Exception as e:
        print(f"Error generating beats: {e}")
        return "[]"

def generate_story(chapter_data, api_key=None):
    """Main function to generate the full story."""
    # 1. Generate Beats
    beats_json_str = generate_beats(chapter_data, api_key=api_key)
    
    # 2. Generate Details from Beats
    story_segments = generate_beat_details(beats_json_str, chapter_data, api_key=api_key)
    
    return story_segments


def generate_chapter_from_prompt(prompt: str, api_key: str | None = None) -> dict:
    """
    Generate a complete visual novel chapter from a simple prompt.
    Returns a properly formatted chapter with dialogue and narration segments.
    """
    # Standardized background options (must match frontend config)
    BACKGROUND_OPTIONS = [
        "favonius_cathedral",
        "mondstadt_night", 
        "statue_of_seven",
        "angels_share"
    ]
    
    system_instructions = """You are a visual novel scene generator. Your task is to create an engaging visual novel scene with dialogue and narration.

Generate a complete scene in JSON format with the following structure:

{
  "title": "An engaging title for the scene",
  "characters": ["Character1", "Character2"],
  "backgrounds": ["background_id"],
  "setting_narration": "A vivid description of the scene setting and atmosphere",
  "segments": [
    {
      "type": "narration",
      "text": "Narrative description of what's happening"
    },
    {
      "type": "dialogue",
      "speaker": "Character1",
      "expression_action": "(emotion or action in parentheses)",
      "line": "What the character says"
    }
  ]
}

IMPORTANT RULES:
1. The "backgrounds" array must contain EXACTLY ONE background ID from this list:
   - "favonius_cathedral" (The grand cathedral of Mondstadt)
   - "mondstadt_night" (The city under the stars)
   - "statue_of_seven" (A statue dedicated to the Anemo Archon)
   - "angels_share" (Diluc's tavern, a popular gathering spot)
2. Choose the background that best matches the scene setting and prompt
3. Each segment must have a "type" field that is either "dialogue" or "narration"
4. Dialogue segments MUST have: type, speaker, line (expression_action is optional)
5. Narration segments MUST have: type, text
6. Create 8-12 segments mixing dialogue and narration for an engaging scene
7. Use expression_action to show emotions like "(nervously)", "(smiling)", "(calmly)", etc.
8. Make the scene feel alive with sensory details and character interactions
9. Return ONLY valid JSON, no markdown code blocks or extra text
"""

    user_prompt = f"""Create a visual novel scene based on this prompt:

{prompt}

Remember to output ONLY the JSON object, nothing else."""

    generation_config = {
        "max_output_tokens": 4096,
        "temperature": 1,
        "top_p": 0.95,
    }

    safety_settings = [
        {
            "category": "HARM_CATEGORY_HATE_SPEECH",
            "threshold": "BLOCK_MEDIUM_AND_ABOVE"
        },
        {
            "category": "HARM_CATEGORY_DANGEROUS_CONTENT",
            "threshold": "BLOCK_MEDIUM_AND_ABOVE"
        },
        {
            "category": "HARM_CATEGORY_SEXUALLY_EXPLICIT",
            "threshold": "BLOCK_MEDIUM_AND_ABOVE"
        },
        {
            "category": "HARM_CATEGORY_HARASSMENT",
            "threshold": "BLOCK_MEDIUM_AND_ABOVE"
        },
    ]
    
    if api_key:
        genai.configure(api_key=api_key)

    model = genai.GenerativeModel(
        "gemini-2.5-flash",
        system_instruction=system_instructions
    )
    
    try:
        response = model.generate_content(
            user_prompt,
            generation_config=generation_config,
            safety_settings=safety_settings,
        )
        
        response_text = response.text
        cleaned_json = clean_json_string(response_text)
        chapter_data = json.loads(cleaned_json)
        
        # Validate the structure
        required_fields = ["title", "characters", "backgrounds", "setting_narration", "segments"]
        for field in required_fields:
            if field not in chapter_data:
                raise ValueError(f"Missing required field: {field}")
        
        # Validate segments
        for i, segment in enumerate(chapter_data["segments"]):
            if "type" not in segment:
                raise ValueError(f"Segment {i} missing 'type' field")
            
            if segment["type"] == "dialogue":
                if "speaker" not in segment or "line" not in segment:
                    raise ValueError(f"Dialogue segment {i} missing required fields")
            elif segment["type"] == "narration":
                if "text" not in segment:
                    raise ValueError(f"Narration segment {i} missing 'text' field")
            else:
                raise ValueError(f"Invalid segment type: {segment['type']}")
        
        return chapter_data
        
    except json.JSONDecodeError as e:
        print(f"JSON parsing error: {e}")
        print(f"Response text: {response_text}")
        raise Exception(f"Failed to parse AI response as JSON: {e}")
    except Exception as e:
        print(f"Error generating chapter: {e}")
        raise


if __name__ == "__main__":
    print("doing the testing")
    # Example chapter data for testing
    test_chapter_data = {
        "characters": ["Diluc", "Kaeya"],
        "start_setting": "Angel's Share Tavern",
        "story_direction": "The Windblume Festival has just ended and the city is winding down its celebrations. Diluc is nursing a glass of red wine alone in the tavern. The door swings open, and Kaeya enters with an arrogant smile."
    }
    
    # Call the main story generation function
    full_story = generate_story(test_chapter_data)
    print("\n--- Full Story Segments ---")
    for segment in full_story:
        print(json.dumps(segment, indent=2))

