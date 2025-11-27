import json
import sys
from pathlib import Path

def get_all_keys(obj, parent_key=''):
    """Recursively extract all keys from a nested dictionary"""
    keys = set()
    if isinstance(obj, dict):
        for k, v in obj.items():
            current_key = f"{parent_key}.{k}" if parent_key else k
            keys.add(current_key)
            if isinstance(v, dict):
                keys.update(get_all_keys(v, current_key))
    return keys

def load_translation_file(file_path):
    """Load a JSON translation file"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            return json.load(f)
    except Exception as e:
        print(f"Error loading {file_path}: {e}")
        return None

def main():
    # Define translation directory
    translations_dir = Path('lib/i18n/translations')
    
    # Load English as reference
    en_file = translations_dir / 'en.json'
    en_data = load_translation_file(en_file)
    
    if not en_data:
        print("Failed to load English translation file")
        sys.exit(1)
    
    # Get all English keys
    en_keys = get_all_keys(en_data)
    print(f"Total keys in English: {len(en_keys)}\n")
    
    # Languages to check
    languages = {
        'fr': 'French',
        'es': 'Spanish',
        'it': 'Italian',
        'pt': 'Portuguese',
        'de': 'German',
        'bn': 'Bengali',
        'ru': 'Russian',
        'vi': 'Vietnamese'
    }
    
    all_missing_keys = {}
    all_extra_keys = {}
    
    # Check each language
    for lang_code, lang_name in languages.items():
        lang_file = translations_dir / f'{lang_code}.json'
        lang_data = load_translation_file(lang_file)
        
        if not lang_data:
            print(f"❌ {lang_name} ({lang_code}.json): Failed to load")
            continue
        
        # Get language keys
        lang_keys = get_all_keys(lang_data)
        
        # Find missing and extra keys
        missing = en_keys - lang_keys
        extra = lang_keys - en_keys
        
        if missing:
            all_missing_keys[lang_code] = sorted(missing)
        if extra:
            all_extra_keys[lang_code] = sorted(extra)
        
        # Print summary
        status = "✅" if not missing and not extra else "⚠️"
        print(f"{status} {lang_name} ({lang_code}.json):")
        print(f"   Total keys: {len(lang_keys)}")
        print(f"   Missing keys: {len(missing)}")
        print(f"   Extra keys: {len(extra)}")
        print()
    
    # Print detailed missing keys report
    if all_missing_keys:
        print("\n" + "="*80)
        print("MISSING KEYS DETAILS")
        print("="*80)
        for lang_code, missing_keys in all_missing_keys.items():
            lang_name = languages[lang_code]
            print(f"\n{lang_name} ({lang_code}.json) - Missing {len(missing_keys)} keys:")
            for key in missing_keys:
                print(f"  - {key}")
    
    # Print detailed extra keys report
    if all_extra_keys:
        print("\n" + "="*80)
        print("EXTRA KEYS DETAILS (keys in language but not in English)")
        print("="*80)
        for lang_code, extra_keys in all_extra_keys.items():
            lang_name = languages[lang_code]
            print(f"\n{lang_name} ({lang_code}.json) - Extra {len(extra_keys)} keys:")
            for key in extra_keys:
                print(f"  - {key}")
    
    # Summary
    print("\n" + "="*80)
    print("SUMMARY")
    print("="*80)
    total_issues = sum(len(keys) for keys in all_missing_keys.values())
    total_extra = sum(len(keys) for keys in all_extra_keys.values())
    
    if total_issues == 0 and total_extra == 0:
        print("✅ All translation files are in sync with English!")
    else:
        print(f"⚠️  Total missing keys across all languages: {total_issues}")
        print(f"⚠️  Total extra keys across all languages: {total_extra}")
        print("\nLanguages with missing keys:")
        for lang_code in all_missing_keys:
            print(f"  - {languages[lang_code]} ({lang_code}): {len(all_missing_keys[lang_code])} missing")
        if all_extra_keys:
            print("\nLanguages with extra keys:")
            for lang_code in all_extra_keys:
                print(f"  - {languages[lang_code]} ({lang_code}): {len(all_extra_keys[lang_code])} extra")

if __name__ == '__main__':
    main()
