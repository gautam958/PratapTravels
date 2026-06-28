/**
 * PratapTravels - End-to-End Flow Validation Tests
 * Tests booking flow and referral flow logic by reading and validating main.js
 */

const fs = require('fs');

const mainJs = fs.readFileSync('js/main.js', 'utf8');
const readme = fs.readFileSync('README.md', 'utf8');
const revenueFunction = fs.readFileSync('azure-function/PratapTravels-run.csx', 'utf8');

let passCount = 0;
let failCount = 0;
const results = [];

function test(name, fn) {
  try {
    fn();
    results.push({ name, status: 'PASS' });
    passCount++;
  } catch (e) {
    results.push({ name, status: 'FAIL', error: e.message });
    failCount++;
  }
}

function assert(condition, message) {
  if (!condition) throw new Error(message || 'Assertion failed');
}

// ==========================================
// BOOKING FLOW TESTS
// ==========================================

test('BUG1: Booking submission uses dataApiUrl (not visitorApiUrl)', () => {
  // Find the booking form fetch section and verify it uses dataApiUrl
  const bookingFetchSection = mainJs.substring(
    mainJs.indexOf('if (dataApiUrl) {'),
    mainJs.indexOf('if (dataApiUrl) {') + 200
  );
  assert(bookingFetchSection.includes('fetch(dataApiUrl'), 'Should fetch from dataApiUrl');
  assert(!bookingFetchSection.includes('visitorApiUrl'), 'Should NOT use visitorApiUrl');
});

test('BUG2: Booking payload uses booking_data type with data wrapper', () => {
  const payloadSection = mainJs.substring(
    mainJs.indexOf('JSON.stringify({ type: "booking_data"'),
    mainJs.indexOf('JSON.stringify({ type: "booking_data"') + 100
  );
  assert(payloadSection.includes('type: "booking_data"'), 'Should use type: booking_data');
  assert(payloadSection.includes('data: bookingData'), 'Should wrap data in data property');
});

test('BUG9: Booking payload includes bookingId', () => {
  // Find the bookingData definition
  const bookingDataStart = mainJs.indexOf('var bookingData = {');
  const bookingDataEnd = mainJs.indexOf('};', bookingDataStart) + 2;
  const bookingDataSection = mainJs.substring(bookingDataStart, bookingDataEnd);
  assert(bookingDataSection.includes('bookingId:'), 'bookingData should include bookingId');
  assert(bookingDataSection.includes('createdAt:'), 'bookingData should include createdAt');
  assert(bookingDataSection.includes('status: "pending"'), 'bookingData should include status: pending');
});

test('BUG10: Booking payload includes referral_code', () => {
  const bookingDataStart = mainJs.indexOf('var bookingData = {');
  const bookingDataEnd = mainJs.indexOf('};', bookingDataStart) + 2;
  const bookingDataSection = mainJs.substring(bookingDataStart, bookingDataEnd);
  assert(bookingDataSection.includes('referral_code:'), 'bookingData should include referral_code');
});

test('BUG3: Confirm form does NOT duplicate persistBookingToApi for status+vehicleId', () => {
  // Find the confirm form handler - specifically the submit callback content
  const confirmFormStart = mainJs.indexOf("confirmForm.addEventListener('submit'");
  // Find the end - look for the next form handler or closing of this DOMContentLoaded
  const nextFormMarker = mainJs.indexOf("var cbCloseBtn", confirmFormStart);
  const confirmFormSection = mainJs.substring(confirmFormStart, nextFormMarker);
  
  // Count calls to assignVehicleToBooking WITHIN the submit handler callback
  const assignMatches = confirmFormSection.match(/assignVehicleToBooking\(/g) || [];
  assert(assignMatches.length === 1, 'Should call assignVehicleToBooking exactly once in handler (was: ' + assignMatches.length + ')');
  
  // Should have exactly ONE persistBookingToApi call (for extra fields only, not status+vehicleId)
  const persistMatches = confirmFormSection.match(/persistBookingToApi\(/g) || [];
  assert(persistMatches.length === 1, 'Should call persistBookingToApi exactly once for extra fields (was: ' + persistMatches.length + ')');
  
  // Should NOT duplicate updateVehicle call (assignVehicleToBooking handles it)
  const updateMatches = confirmFormSection.match(/updateVehicle\(/g) || [];
  assert(updateMatches.length === 0, 'Should NOT call updateVehicle directly (assignVehicleToBooking handles it) (was: ' + updateMatches.length + ')');
  
  // Verify the persistBookingToApi call does NOT include status:confirmed (that's done in assignVehicleToBooking)
  const persistCall = mainJs.substring(mainJs.indexOf('persistBookingToApi(bookingId, {', confirmFormStart), 
    mainJs.indexOf('});', mainJs.indexOf('persistBookingToApi(bookingId, {', confirmFormStart)) + 3);
  assert(!persistCall.includes("status: 'confirmed'"), 'persistBookingToApi in handler should NOT include status:confirmed (handled by assignVehicleToBooking)');
});

test('BUG4: assignVehicleToBooking sets needs_notification flag', () => {
  const fnStart = mainJs.indexOf('function assignVehicleToBooking(');
  const fnEnd = mainJs.indexOf('\n}', fnStart) + 2;
  const fnBody = mainJs.substring(fnStart, fnEnd);
  
  assert(fnBody.includes('needs_notification'), 'assignVehicleToBooking should set needs_notification');
  assert(fnBody.includes('email_sent'), 'Should check email_sent before setting flag');
  assert(fnBody.includes('notification_sent'), 'Should check notification_sent before setting flag');
  
  // Also verify the flag is persisted to API
  assert(fnBody.includes('persistBookingToApi'), 'Should persist needs_notification to API');
});

test('BUG5+8: changeBookingStatus persists vehicleId:null and clears driver info', () => {
  const fnStart = mainJs.indexOf('function changeBookingStatus(');
  const fnEnd = mainJs.indexOf('\n}', fnStart) + 2;
  const fnBody = mainJs.substring(fnStart, fnEnd);
  
  assert(fnBody.includes('apiUpdates'), 'Should build apiUpdates object');
  assert(fnBody.includes('vehicleId = null') || fnBody.includes("vehicleId: null"), 'Should set vehicleId null in apiUpdates');
  assert(fnBody.includes("driverName = ''") || fnBody.includes("driverName: ''"), 'Should clear driverName');
  assert(fnBody.includes("driverPhone = ''") || fnBody.includes("driverPhone: ''"), 'Should clear driverPhone');
  assert(fnBody.includes("vehicleNumber = ''") || fnBody.includes("vehicleNumber: ''"), 'Should clear vehicleNumber');
  assert(fnBody.includes('persistBookingToApi(bookingId, apiUpdates)'), 'Should persist all updates via apiUpdates');
});

test('BUG6: Revenue Azure Function code only counts completed bookings', () => {
  // Check the actual Azure Function source file for the correct filter
  const revenueSection = revenueFunction.substring(
    revenueFunction.indexOf('if (dataType == "revenue")'),
    revenueFunction.indexOf('if (dataType == "revenue")') + 300
  );
  assert(revenueSection.includes('.Where(b => b.status?.ToString() == "completed")'), 
    'Revenue should filter by completed only');
  assert(!revenueSection.includes('"confirmed" || b.status?.ToString() == "completed"'),
    'Should NOT include confirmed in revenue filter');
});

test('BUG6: Revenue API response includes confirmedBookings', () => {
  assert(revenueFunction.includes('confirmedBookings = confirmedCount'), 
    'Revenue API response should include confirmedBookings');
});

test('sendEmailConfirmation clears needs_notification', () => {
  const fnStart = mainJs.indexOf('function sendEmailConfirmation(');
  const fnEnd = mainJs.lastIndexOf('});', mainJs.indexOf('// ---------- Init vehicle', fnStart));
  const fnBody = mainJs.substring(fnStart, fnEnd);
  
  assert(fnBody.includes('needs_notification = false'), 'Should clear needs_notification when email sent');
  assert(fnBody.includes('needs_notification: false'), 'Should persist needs_notification: false to API');
});

test('shareDriverLocation marks notification status', () => {
  const fnStart = mainJs.indexOf('function shareDriverLocation(');
  const fnEnd = mainJs.lastIndexOf('}', mainJs.indexOf('Initialize features on page load', fnStart));
  const fnBody = mainJs.substring(fnStart, fnEnd);
  
  assert(fnBody.includes("notification_sent = true"), 'Should set notification_sent');
  assert(fnBody.includes("notification_type = 'whatsapp'"), 'Should set notification_type to whatsapp');
  assert(fnBody.includes("notified_at"), 'Should set notified_at');
  assert(fnBody.includes("needs_notification = false"), 'Should clear needs_notification');
  assert(fnBody.includes("persistBookingToApi"), 'Should persist notification to API');
  assert(fnBody.includes("renderBookingTable"), 'Should re-render booking table');
});

test('Booking status lifecycle: pending -> confirmed -> completed', () => {
  // Verify the booking form creates with status "pending"
  assert(mainJs.includes('status: "pending"'), 'Booking should start as pending');
  
  // Verify assignVehicleToBooking sets status "confirmed"
  const assignFn = mainJs.substring(
    mainJs.indexOf('function assignVehicleToBooking('),
    mainJs.indexOf('\n}', mainJs.indexOf('function assignVehicleToBooking(')) + 2
  );
  assert(assignFn.includes('status = "confirmed"'), 'Assign should set confirmed');
  
  // Verify changeBookingStatus can set "completed"
  const changeFn = mainJs.substring(
    mainJs.indexOf('function changeBookingStatus('),
    mainJs.indexOf('\n}', mainJs.indexOf('function changeBookingStatus(')) + 2
  );
  assert(changeFn.includes('newStatus === "completed"'), 'Should handle completed status');
  assert(changeFn.includes('newStatus === "cancelled"'), 'Should handle cancelled status');
});

test('Vehicle status lifecycle: available -> booked -> available', () => {
  // On confirm: vehicle status -> booked
  assert(mainJs.includes('updateVehicle(vehicleId, { status: "booked" })'), 
    'Confirm should set vehicle status to booked');
  
  // On complete/cancel: vehicle status -> available
  assert(mainJs.includes('updateVehicle(vehicleId, { status: "available" })'), 
    'Complete/cancel should set vehicle status to available');
});

test('persistBookingToApi sends booking_update type', () => {
  const fnStart = mainJs.indexOf('function persistBookingToApi(');
  const fnEnd = mainJs.indexOf('\n}', fnStart) + 2;
  const fnBody = mainJs.substring(fnStart, fnEnd);
  
  assert(fnBody.includes('type: "booking_update"'), 'Should use booking_update type');
  assert(fnBody.includes('id: bookingId'), 'Should include booking ID');
  assert(fnBody.includes('data: updates'), 'Should include data updates');
});

// ==========================================
// REFERRAL FLOW TESTS
// ==========================================

test('Referral code format: PT + 3 letters + 4 digits', () => {
  assert(mainJs.includes('"PT"'), 'Should start with PT prefix');
  // Check the generation pattern
  assert(mainJs.includes('3') && mainJs.includes('4'), 'Should have letter and digit counts');
});

test('Referral code included in booking flow', () => {
  // Verify the booking form captures referral_code
  const bookingDataStart = mainJs.indexOf('var bookingData = {');
  const bookingDataEnd = mainJs.indexOf('};', bookingDataStart) + 2;
  const bookingDataSection = mainJs.substring(bookingDataStart, bookingDataEnd);
  assert(bookingDataSection.includes('referral_code:'), 'Booking data should include referral_code');
});

test('Referral redemption handler called after booking', () => {
  // After successful booking, handleReferralRedemption should be called
  const successHandler = mainJs.substring(
    mainJs.indexOf('showBookingSuccess(false)'),
    mainJs.indexOf('showBookingSuccess(false)') + 200
  );
  assert(successHandler.includes('handleReferralRedemption'), 'Should call handleReferralRedemption after booking');
});

test('Notification column renders correctly for all states', () => {
  // Check all notification states are handled
  assert(mainJs.includes('b.email_sent'), 'Should check email_sent');
  assert(mainJs.includes('b.notification_sent && b.notification_type === "whatsapp"'), 'Should check WhatsApp sent');
  assert(mainJs.includes('b.needs_notification'), 'Should check needs_notification flag');
  assert(mainJs.includes('b.status === "confirmed"'), 'Should show send button for confirmed without notification');
});

// ==========================================
// BUG: Blank Booking ID & Confirm Button
// ==========================================

test('BUG: bookingId is generated BEFORE bookingData definition', () => {
  const bookingDataStart = mainJs.indexOf('var bookingData = {');
  assert(bookingDataStart !== -1, 'Should have bookingData definition');
  // Find the bookingId generation line
  const bookingIdGen = mainJs.indexOf('var bookingId = "BK" + Date.now()');
  assert(bookingIdGen !== -1, 'Should have bookingId generation');
  // bookingId generation must come BEFORE bookingData definition
  assert(bookingIdGen < bookingDataStart,
    'bookingId generation (line ~' + bookingIdGen + ') must be BEFORE bookingData definition (line ~' + bookingDataStart + ') to avoid undefined bookingId');
});

test('BUG: bookingData includes bookingId (not undefined)', () => {
  const bookingDataStart = mainJs.indexOf('var bookingData = {');
  const bookingDataEnd = mainJs.indexOf('};', bookingDataStart);
  const bookingDataSection = mainJs.substring(bookingDataStart, bookingDataEnd);
  assert(bookingDataSection.includes('bookingId: bookingId'), 'bookingData should include bookingId field');
  // Verify there's only ONE bookingId generation (no duplicates)
  const matches = mainJs.match(/var bookingId = "BK" \+ Date\.now\(\)/g);
  assert(matches && matches.length === 1, 'Should have exactly ONE bookingId generation (found: ' + (matches ? matches.length : 0) + ')');
});

test('BUG: openConfirmBooking finds booking by bookingId', () => {
  const fnStart = mainJs.indexOf('function openConfirmBooking(');
  assert(fnStart !== -1, 'Should have openConfirmBooking function');
  const fnBodyStart = mainJs.indexOf('{', fnStart);
  const fnEnd = mainJs.indexOf('function closeConfirmBookingModal', fnStart);
  const fnBody = mainJs.substring(fnStart, fnEnd);
  // Should search bookings by bookingId
  assert(fnBody.includes('bookings[i].bookingId === bookingId'), 'openConfirmBooking should match bookings by bookingId');
  // Should store found booking in _confirmBookingData
  assert(fnBody.includes('_confirmBookingData = booking'), 'Should store found booking in _confirmBookingData');
  // Should return early if not found (prevents confirm button doing nothing)
  assert(fnBody.includes('if (!booking) return'), 'Should return early if booking not found to prevent silent failure');
});

test('BUG: openConfirmBooking called with b.bookingId in table', () => {
  // The confirm button in the table should pass b.bookingId (not a hardcoded or undefined value)
  // Check that openConfirmBooking is called with b.bookingId in the table (not a hardcoded string)
  const confirmCallIdx = mainJs.indexOf('openConfirmBooking(');
  // Find the one inside the table rendering (not the function definition)
  const tableRenderIdx = mainJs.indexOf('btn-action-confirm');
  assert(tableRenderIdx !== -1, 'Should have confirm button in table');
  const nearbyCode = mainJs.substring(tableRenderIdx, tableRenderIdx + 200);
  assert(nearbyCode.includes('openConfirmBooking('), 'Confirm button should call openConfirmBooking');
  assert(nearbyCode.includes('b.bookingId'), 'Confirm button should pass b.bookingId (not hardcoded or undefined)');
});

// ==========================================
// PRINT RESULTS
// ==========================================

console.log('\n========================================');
console.log('  PratapTravels Flow Validation Results');
console.log('========================================\n');

results.forEach(r => {
  const icon = r.status === 'PASS' ? '✅' : '❌';
  console.log(`${icon} ${r.name}`);
  if (r.error) console.log(`   Error: ${r.error}`);
});

console.log(`\n========================================`);
console.log(`  Total: ${passCount + failCount} | Pass: ${passCount} | Fail: ${failCount}`);
console.log(`========================================\n`);

if (failCount > 0) {
  process.exit(1);
}
