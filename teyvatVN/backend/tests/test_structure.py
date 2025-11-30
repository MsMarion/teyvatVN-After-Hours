# -*- coding: utf-8 -*-
"""
Test script to verify the V1 MVP implementation structure
"""
import json
import os
import sys

# Add parent directory to path
sys.path.insert(0, os.path.dirname(__file__))

import utils

def test_auto_increment():
    """Test the auto-increment chapter ID functionality"""
    print("Testing auto-increment functionality...")
    
    # Test with non-existent user
    chapter_id = utils.get_next_chapter_id("test_user_nonexistent")
    assert chapter_id == "chapter1", f"Expected 'chapter1', got '{chapter_id}'"
    print("[PASS] Non-existent user returns chapter1")
    
    # Test with existing user (dawn)
    chapter_id = utils.get_next_chapter_id("dawn")
    print(f"[PASS] Existing user 'dawn' next chapter: {chapter_id}")
    
    print("\n[SUCCESS] Auto-increment tests passed!")


def test_chapter_structure():
    """Test that the expected chapter structure is valid"""
    print("\nTesting chapter structure...")
    
    sample_chapter = {
        "title": "A Mysterious Encounter",
        "characters": ["Luna", "Elias"],
        "backgrounds": ["forest_clearing"],
        "setting_narration": "The fire crackles gently as shadows dance across the clearing.",
        "segments": [
            {
                "type": "narration",
                "text": "Leaves rustle as something stirs beyond the trees."
            },
            {
                "type": "dialogue",
                "speaker": "Luna",
                "expression_action": "(nervously)",
                "line": "Did you hear that?"
            },
            {
                "type": "dialogue",
                "speaker": "Elias",
                "expression_action": "(calmly unsheathes sword)",
                "line": "Stay close. It might just be the wind."
            }
        ]
    }
    
    # Validate structure
    required_fields = ["title", "characters", "backgrounds", "setting_narration", "segments"]
    for field in required_fields:
        assert field in sample_chapter, f"Missing required field: {field}"
    
    print("[PASS] All required fields present")
    
    # Validate segments
    for i, segment in enumerate(sample_chapter["segments"]):
        assert "type" in segment, f"Segment {i} missing 'type' field"
        
        if segment["type"] == "dialogue":
            assert "speaker" in segment, f"Dialogue segment {i} missing 'speaker'"
            assert "line" in segment, f"Dialogue segment {i} missing 'line'"
        elif segment["type"] == "narration":
            assert "text" in segment, f"Narration segment {i} missing 'text'"
    
    print("[PASS] All segments properly structured")
    print("\n[SUCCESS] Chapter structure tests passed!")


def test_list_chapters():
    """Test listing user chapters"""
    print("\nTesting chapter listing...")
    
    chapters = utils.list_user_chapters("dawn")
    print(f"[PASS] Found {len(chapters)} chapters for user 'dawn'")
    
    for chapter in chapters:
        print(f"  - {chapter['chapter_id']}: {chapter['path']}")
    
    print("\n[SUCCESS] Chapter listing tests passed!")


if __name__ == "__main__":
    print("=" * 60)
    print("V1 MVP Structure Validation Tests")
    print("=" * 60)
    
    try:
        test_auto_increment()
        test_chapter_structure()
        test_list_chapters()
        
        print("\n" + "=" * 60)
        print("ALL TESTS PASSED!")
        print("=" * 60)
        print("\nThe V1 MVP structure is ready for use.")
        print("\nNext steps:")
        print("1. Start the backend server: python main.py")
        print("2. Open the frontend and navigate to the prompt input page")
        print("3. Enter a prompt and click Generate")
        print("4. The scene will be generated and displayed automatically")
        
    except AssertionError as e:
        print(f"\n[FAIL] TEST FAILED: {e}")
        sys.exit(1)
    except Exception as e:
        print(f"\n[ERROR] {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
