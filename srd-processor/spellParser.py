import pdfplumber
import pandas as pd
import re
from os import path
from pathlib import Path

SRD_CLASSES = [
    "Barbarian", "Bard", "Cleric", "Druid", "Fighter", "Monk", "Paladin", "Ranger", "Rogue", "Sorcerer", "Warlock", "Wizard"
]

def parse_spell_details(spell_segments):
    """
    Parses a single block of text containing one spell's details.
    """
    spell = {
        'Name': 'N/A',
        'Level': 'N/A',
        'School': 'N/A',
        'Classes': [],
        'Casting Time': 'N/A',
        'Range': 'N/A',
        'Components': 'N/A',
        'Duration': 'N/A',
        'Description': 'N/A'
    }
    
    # 1. Spell Name
    # 2. Spell Cantrip or Level Indicator + Spell School + Spell Classes
    # 3. Casting Time
    # 4. Range
    # 5. Components
    # 6. Duration
    # 7. Description
    try:
        spell['Name'] = spell_segments[0]
        # Ignore first part of string before ':', it is just the label
        spell['castingTime'] = spell_segments[2].split(':')[1].strip()
        spell['range'] = spell_segments[3].split(':')[1].strip()
        spell['components'] = spell_segments[4].split(':')[1].strip()
        spell['duration'] = spell_segments[5].split(':')[1].strip()
        spell['description'] = spell_segments[6]

        # Check if the spell has a valid cantrip/level indicator, school, and listed classes
        match = re.search(r"^(?:Level (\d+) (\w+)|(\w+) Cantrip) \((.*?)\)$", spell_segments[1])
        if match:
            if match.group(1): # Matched "1st-level evocation"
                spell['Level'] = match.group(1)
                spell['School'] = match.group(2)
                classes = [class_name.strip() for class_name in match.group(4).split(',')]
                spell['Classes'].append(classes)
            else: # Matched "Conjuration Cantrip (Bard, Sorcerer, Warlock, Wizard)"
                spell['Level'] = '0'
                spell['School'] = match.group(3)
                classes = [class_name.strip() for class_name in match.group(4).split(',')]
                spell['Classes'].append(classes)  
        else:
            return None # Not a valid spell 
        
        return spell
    except Exception as err:
        print(f"Error: Could not parse spell: {spell_segments[0]}")

    return None

def extract_spells_from_pdf(pdf_path, start_page, end_page):
    """
    Extracts spell information from a range of pages in a PDF.
    """
    valid_spells = []
    full_text = ""

    print(f"Reading pages {start_page} to {end_page} from '{pdf_path}'...")
    try:
        with pdfplumber.open(pdf_path) as pdf:
            # Check if page numbers are valid
            if start_page > len(pdf.pages) or end_page > len(pdf.pages):
                print(f"Error: Invalid page range. PDF has {len(pdf.pages)} pages.")
                return None

            for i in range(start_page - 1, end_page):
                page = pdf.pages[i]
                # These pages are split into 2 columns, treat them as continuations from left-to-right
                left_column = page.crop((0, 0, page.width / 2, page.height))
                right_column = page.crop((page.width / 2, 0, page.width, page.height))
                full_text += left_column.extract_text(y_tolerance=4, use_text_flow=True) + "\n" + right_column.extract_text(y_tolerance=4, use_text_flow=True) + "\n"
    except Exception as e:
        print(f"Error reading PDF file: {e}")
        return None

    # This pattern identifies the line *after* a spell name (the level/school line),
    # which is a reliable anchor for finding the actual spell name (header).

    # ([characters] or [characters][,][space][characters]) -- repeating as many times as necessary
    # e.g., (Bard, Druid, Ranger)
    classes_pattern = r"\(\w+|(\w+,\s+\w+)*\)"
    # Level[space][digit][space][characters][space]
    # e.g., Level 1 Enchantment
    spell_with_level_pattern = r"Level\s+\d+\s+\w+\s+"
    # [characters][space]Cantrip[space]
    # e.g., Evocation Cantrip
    spell_cantrip_pattern = r"\w+\s+Cantrip\s+"
    # Anchor pattern is the Spell Level or Cantrip indicator which appears directly below spell header
    spell_header_anchor_pattern = r"^(" + spell_with_level_pattern + classes_pattern + r")|(" + spell_cantrip_pattern + classes_pattern + r")"
    # Spell header is the name of the spell
    # [characters] or [characters][space][characters] -- repeating as many times as necessary
    spell_header_pattern = r"^\w+(\s+\w+)*$"

    # Process current PDF page's content line-by-line
    lines = full_text.split('\n')
    spell_header_indices = []
    # Find all spell headers by looking for the line preceding the anchor pattern
    for ind, line in enumerate(lines):
        if re.match(spell_header_anchor_pattern, line):
            # The previous non-empty line is the spell name.
            spell_header_line = lines[ind - 1]
            # Make sure that the spell header actually looks like a header
            if re.match(spell_header_pattern, spell_header_line):
                print(f"Detected a spell header: {spell_header_line}")
                spell_header_indices.append(ind - 1)
    
    print(f"Found {len(spell_header_indices)} spell headers. Creating spell content blocks...")

    if not spell_header_indices:
        print("No spell headers found. The text splitting logic may need adjustment for this PDF.")
        return pd.DataFrame()

    # Set the previous ind to the first one, to avoid counting the first header as its own spell
    prev_ind = spell_header_indices[0]
    spell_content_blocks = []
    for spell_header_ind in spell_header_indices:
        if spell_header_ind != prev_ind:
            # Avoid copying the header of the next spell into this spell
            spell_content_blocks.append(lines[prev_ind:(spell_header_ind - 1)])
        # Update previous ind
        prev_ind = spell_header_ind

    # Copying the remaining text into the final spell
    spell_content_blocks.append(lines[prev_ind:])

    print(f"Found {len(spell_content_blocks)} spell content blocks to parse.")

    for spell_content_block in spell_content_blocks:
        # Ignore all empty spell content blocks
        if not spell_content_block:
            continue

        # Clean up spell name so that the first letter of each word is uppercase while other letters are lowercase
        # e.g., sPeLl NaMe iS WrITTEn LIKE a TiTlE --> Spell Name Is Written Like A Title
        spell_content_block[0] = spell_content_block[0].title()
        
        # Split spell content into component segments, for example:
        # -------------------------
        # 1 - "Acid Arrow"
        # 2 - "Level 2 Evocation (Wizard)", 
        # 3 - "Casting Time: Action", 
        # 4 - "Range: 90 feet", 
        # 5 - "Components: V, S, M (powdered rhubarb leaf)" 
        # 6 - "Duration: Instantaneous"
        # 7 - Everything else is the spell description
        # -------------------------
        spell_segments = []
        spell_description = ""
        prev_line_had_dash = False
        paren_not_closed = False
        for (ind, spell_line) in enumerate(spell_content_block):
            # Keep populating the same spell segment until the parentheses closes
            if paren_not_closed:
                spell_segments[-1] += " " + spell_line
                # Check if parentheses still not closed yet
                paren_not_closed = ')' not in spell_line
            # Check if the first 6 components have been populated yet
            elif len(spell_segments) < 6: 
                spell_segments.append(spell_line)
                # Check if parentheses not closed in same line
                paren_not_closed = '(' in spell_line and ')' not in spell_line
            # Remaining lines are a part of the spell description
            else:
                line_has_dash = spell_line.endswith('-')

                # This line completes the dashed word from the end of the previous line or is the start of the description
                # Either way, it will not need a space (no dash to remove from end)
                if (prev_line_had_dash and not line_has_dash) or (not spell_description and not line_has_dash): 
                    spell_description += spell_line
                # This line has a dashed word which needs to be completed by the next line (dash to remove from end)
                # It also is completing the dashed word from the end of the previous line
                elif prev_line_had_dash and line_has_dash:
                    spell_description += spell_line[:-1]
                # This line has a dashed word which needs to be completed by the next line (dash to remove from end)
                # It is not completing a dashed word from the end of the previous line
                elif not prev_line_had_dash and line_has_dash:
                    spell_description += " " + spell_line[:-1]
                # The previous line must have ended with a word requiring a space after it
                else:
                    spell_description += " " + spell_line
                # Indicate that previous line had a dash
                prev_line_had_dash = line_has_dash

        # The rest of the string is the description
        spell_segments.append(spell_description)

        # Parse the spell block into its constituent parts
        spell_data = parse_spell_details(spell_segments)
        if spell_data:
            # If able to find all constituent parts in the spell content block, save it as a valid spell
            valid_spells.append(spell_data)

    return pd.DataFrame(valid_spells)

if __name__ == "__main__":
    # Check for command-line argument for the PDF file
    script_dir = Path(__file__).parent.resolve()
    pdf_file_path = path.join(script_dir, "SRD_CC_v5.2.1.pdf")
    
    # As per the request, targeting pages 107-112 of the Player's Handbook
    # These might need to be adjusted for your specific PDF version
    START_PAGE = 107
    END_PAGE = 175

    spells_df = extract_spells_from_pdf(pdf_file_path, START_PAGE, END_PAGE)

    if spells_df is not None and not spells_df.empty:
        # Display the tabulated data in the console
        print("\n--- Tabulated Spell Data ---")
        print(spells_df.to_string())

        # Save the tabulated data to a JSON file for easy use
        # Move output out of srd-processor/ and into back-end/data/
        output_json_path = path.join(script_dir, "../back-end/data/spells.json")
        # Use orient='records' to get a list of objects, which matches the desired JSON structure.
        # Use indent=4 for pretty-printing.
        spells_df.to_json(output_json_path, orient='records', indent=4)
        print(f"\nData saved to '{output_json_path}'")