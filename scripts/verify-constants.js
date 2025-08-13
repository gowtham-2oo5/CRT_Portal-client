// Quick verification script for TimeSlot constants
const fs = require('fs');
const path = require('path');

console.log('🔍 Verifying TimeSlot Constants...\n');

// Read the types file
const typesFile = path.join(__dirname, '../lib/types/section-schedule.ts');
const content = fs.readFileSync(typesFile, 'utf8');

// Check for required constants
const requiredConstants = [
  'DAYS_OF_WEEK',
  'SLOT_TYPES', 
  'DAY_DISPLAY_NAMES',
  'SLOT_TYPE_DISPLAY_NAMES'
];

const requiredTypes = [
  'TimeSlot',
  'CreateTimeSlotRequest',
  'UpdateTimeSlotRequest'
];

console.log('✅ Checking Constants:');
requiredConstants.forEach(constant => {
  const regex = new RegExp(`export const ${constant}`, 'g');
  if (content.match(regex)) {
    console.log(`  ✓ ${constant} - Found and exported`);
  } else {
    console.log(`  ✗ ${constant} - Missing or not exported`);
  }
});

console.log('\n✅ Checking Types:');
requiredTypes.forEach(type => {
  const regex = new RegExp(`export interface ${type}`, 'g');
  if (content.match(regex)) {
    console.log(`  ✓ ${type} - Found and exported`);
  } else {
    console.log(`  ✗ ${type} - Missing or not exported`);
  }
});

// Check for specific enum values
console.log('\n✅ Checking Enum Values:');
const slotTypes = ['REGULAR', 'BREAK', 'EXAM', 'SPECIAL'];
const days = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];

slotTypes.forEach(type => {
  if (content.includes(`"${type}"`)) {
    console.log(`  ✓ SlotType.${type} - Found`);
  } else {
    console.log(`  ✗ SlotType.${type} - Missing`);
  }
});

days.forEach(day => {
  if (content.includes(`"${day}"`)) {
    console.log(`  ✓ Day.${day} - Found`);
  } else {
    console.log(`  ✗ Day.${day} - Missing`);
  }
});

console.log('\n🎉 Verification Complete!');
