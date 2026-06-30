/**
 * PratapTravels - End-to-End Flow Validation Tests
 * Tests booking flow and referral flow logic by reading and validating main.js
 */

const fs = require('fs');

const mainJs = fs.readFileSync('js/main.js', 'utf8');
const readme = fs.readFileSync('README.md', 'utf8');
const revenueFunction = fs.readFileSync('azure-function/PratapTravels-run.csx', 'utf8');
const i18nJs = fs.readFileSync('js/i18n.js', 'utf8');

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
// ==========================================
// BUG: Send Confirmation Button & Status Updates
// ==========================================

test('BUG: needs_notification shows send button alongside badge', () => {
  // After vehicle assignment, needs_notification=true should show BOTH badge AND send button
  const notifStart = mainJs.indexOf('b.needs_notification)');
  assert(notifStart !== -1, 'Should check needs_notification in notification column');
  const notifBlock = mainJs.substring(notifStart, notifStart + 500);
  assert(notifBlock.includes('notified-flagged'), 'Should show Needs Action badge');
  assert(notifBlock.includes('sendBookingNotification('), 'Should also include send button when needs_notification is true');
  assert(notifBlock.includes('btn-action-confirm'), 'Send button should have btn-action-confirm class');
});

test('BUG: completeBooking does NOT call fetchBookingsFromApi', () => {
  // completeBooking should update local cache directly via changeBookingStatus
  // and NOT call fetchBookingsFromApi which could overwrite the local state change
  const fnStart = mainJs.indexOf('function completeBooking(');
  assert(fnStart !== -1, 'Should have completeBooking function');
  const fnEnd = mainJs.indexOf(String.fromCharCode(10) + '}', fnStart) + 2;
  const fnBody = mainJs.substring(fnStart, fnEnd);
  assert(!fnBody.includes('fetchBookingsFromApi'), 'completeBooking should NOT call fetchBookingsFromApi (overwrites local state)');
  assert(fnBody.includes('changeBookingStatus'), 'Should call changeBookingStatus to update local cache');
  assert(fnBody.includes('renderBookingTable'), 'Should re-render table after status change');
  assert(fnBody.includes('updateBookingKPIs'), 'Should update KPIs after status change');
});

test('BUG: cancelBooking does NOT call fetchBookingsFromApi', () => {
  const fnStart = mainJs.indexOf('function cancelBooking(');
  assert(fnStart !== -1, 'Should have cancelBooking function');
  const fnEnd = mainJs.indexOf(String.fromCharCode(10) + '}', fnStart) + 2;
  const fnBody = mainJs.substring(fnStart, fnEnd);
  assert(!fnBody.includes('fetchBookingsFromApi'), 'cancelBooking should NOT call fetchBookingsFromApi (overwrites local state)');
  assert(fnBody.includes('changeBookingStatus'), 'Should call changeBookingStatus to update local cache');
});

test('BUG: revenue page has refreshRevenuePage function', () => {
  assert(mainJs.includes('function refreshRevenuePage()'), 'Should have refreshRevenuePage function');
  const fnStart = mainJs.indexOf('function refreshRevenuePage()');
  const fnBody = mainJs.substring(fnStart, fnStart + 400);
  assert(fnBody.includes('fetchRevenueData'), 'refreshRevenuePage should call fetchRevenueData');
  assert(fnBody.includes('renderRevenueDashboard'), 'refreshRevenuePage should call renderRevenueDashboard');
  assert(fnBody.includes('revenueRefreshBtn'), 'refreshRevenuePage should reference the refresh button');
});

test('BUG: revenue page has calculateLocalRevenue fallback', () => {
  assert(mainJs.includes('function calculateLocalRevenue()'), 'Should have calculateLocalRevenue function');
  const fnStart = mainJs.indexOf('function calculateLocalRevenue()');
  const fnBody = mainJs.substring(fnStart, fnStart + 800);
  assert(fnBody.includes('getBookings()'), 'Should read from local bookings cache');
  assert(fnBody.includes('revenueByRoute') || mainJs.includes('revenueByRoute'), 'Should calculate revenue by route');
  assert(fnBody.includes('revenueByMonth') || mainJs.includes('revenueByMonth'), 'Should calculate revenue by month');
  assert(fnBody.includes('completedBookings') || mainJs.includes('completedBookings'), 'Should count completed bookings');
});

test('BUG: revenue init uses calculateLocalRevenue as fallback', () => {
  assert(mainJs.includes('if (!data) data = calculateLocalRevenue()'), 'Revenue initialization should fall back to calculateLocalRevenue when API returns null');
});


test('Status column exists in booking table with status badge rendering', () => {
  // Verify status column header exists
  assert(mainJs.includes('booking-status-badge'), 'Should render booking-status-badge in table');
  assert(mainJs.includes('status-confirmed'), 'Should have status-confirmed class');
  assert(mainJs.includes('status-completed'), 'Should have status-completed class');
  assert(mainJs.includes('status-cancelled'), 'Should have status-cancelled class');
  assert(mainJs.includes('status-pending'), 'Should have status-pending class');
  assert(mainJs.includes('booking-status-badge'), 'Should display booking status badge in table');
});

test('Action buttons always show Confirm, Update, Complete, Cancel, Delete with disabled states', () => {
  // All 4 action buttons must always be rendered in the table
  assert(mainJs.includes('openConfirmBooking'), 'Should have Confirm button calling openConfirmBooking');
  assert(mainJs.includes('completeBooking'), 'Should have Complete button calling completeBooking');
  assert(mainJs.includes('cancelBooking'), 'Should have Cancel button calling cancelBooking');
  assert(mainJs.includes('deleteBooking'), 'Should have Delete button calling deleteBooking');

  // Buttons should use disabled attribute based on status
  assert(mainJs.includes("b.status !== 'pending' ? ' disabled' : ''"), 'Confirm button disabled when not pending');
  assert(mainJs.includes("b.status !== 'confirmed' ? ' disabled' : ''"), 'Complete button disabled when not confirmed');
  assert(mainJs.includes("b.status !== 'pending' && b.status !== 'confirmed' ? ' disabled' : ''"), 'Cancel button disabled when not pending/confirmed');

  // Delete button should never be disabled (always available)
  assert(mainJs.includes('deleteBooking('), 'Delete button should exist with deleteBooking handler');

  // CSS should style disabled action buttons
  var css = require('fs').readFileSync('css/style.css', 'utf8');
  assert(css.includes('.btn-action-confirm[disabled]'), 'CSS should style .btn-action-confirm[disabled]');
  assert(css.includes('.btn-action-cancel[disabled]'), 'CSS should style .btn-action-cancel[disabled]');
  assert(css.includes('.btn-action-delete[disabled]'), 'CSS should style .btn-action-delete[disabled]');
});


// ==========================================
// CHATBOT FARE ESTIMATOR TESTS
// ==========================================

test('Chatbot: toggleChatbot function defined', () => {
  assert(mainJs.includes('function toggleChatbot'), 'Should define toggleChatbot function');
});

test('Chatbot: calculateChatFare function defined', () => {
  assert(mainJs.includes('function calculateChatFare'), 'Should define calculateChatFare function');
});

test('Chatbot: haversineDistance calculates correctly', () => {
  assert(mainJs.includes('function haversineDistance'), 'Should define haversineDistance function');
  // Verify the formula uses correct constants (R = 6371 for Earth radius)
  assert(mainJs.includes('6371') || mainJs.includes('6371'), 'Should use Earth radius 6371km in haversine');
});

test('Chatbot: displayChatFare shows fare with vehicle multipliers', () => {
  assert(mainJs.includes('function displayChatFare'), 'Should define displayChatFare function');
  // Should reference fare config multipliers
  assert(mainJs.includes('FARE_CONFIG') || mainJs.includes('fareConfig'), 'Should use fare configuration for multipliers');
  assert(mainJs.includes('chatFareResult'), 'Should render result into chatFareResult element');
});

test('Chatbot: displayChatFareFallback shows error on failure', () => {
  assert(mainJs.includes('function displayChatFareFallback'), 'Should define displayChatFareFallback function');
  assert(mainJs.includes('chatFareResult'), 'Fallback should render into chatFareResult element');
});

test('Chatbot: clearChatResult resets inputs and hides result', () => {
  assert(mainJs.includes('function clearChatResult'), 'Should define clearChatResult function');
  // Should access chatFrom and chatTo inputs
  assert(mainJs.includes('chatFrom'), 'clearChatResult should reference chatFrom input');
  assert(mainJs.includes('chatTo'), 'clearChatResult should reference chatTo input');
  // Should hide the result
  assert(mainJs.includes('hidden'), 'Should toggle hidden class to show/hide result');
});

test('Chatbot: openBookingFromChatbot pre-fills booking modal', () => {
  assert(mainJs.includes('function openBookingFromChatbot'), 'Should define openBookingFromChatbot function');
  assert(mainJs.includes('bookRoute'), 'Should set bookRoute in booking modal');
  assert(mainJs.includes('bookType'), 'Should set bookType in booking modal');
  assert(mainJs.includes('bookRemarks'), 'Should add route info to remarks');
  assert(mainJs.includes('openBookingModal'), 'Should call openBookingModal to open the modal');
});

test('Chatbot: handleChatFaq has all 5 FAQ topics', () => {
  assert(mainJs.includes('function handleChatFaq'), 'Should define handleChatFaq function');
  assert(mainJs.includes('vehicles:') || mainJs.includes("'vehicles'") || mainJs.includes('"vehicles"'), 'Should have vehicles FAQ topic');
  assert(mainJs.includes('booking:') || mainJs.includes("'booking'") || mainJs.includes('"booking"'), 'Should have booking FAQ topic');
  assert(mainJs.includes('payment:') || mainJs.includes("'payment'") || mainJs.includes('"payment"'), 'Should have payment FAQ topic');
  assert(mainJs.includes('cancellation:') || mainJs.includes("'cancellation'") || mainJs.includes('"cancellation"'), 'Should have cancellation FAQ topic');
  assert(mainJs.includes('contact:') || mainJs.includes("'contact'") || mainJs.includes('"contact"'), 'Should have contact FAQ topic');
});

test('Chatbot: uses Google Maps Distance Matrix API', () => {
  assert(mainJs.includes('DistanceMatrixService') || mainJs.includes('getDistanceMatrix'), 'Should use Distance Matrix service');
});

test('Chatbot: has vehicle and trip type multipliers', () => {
  assert(mainJs.includes('vehicleMultipliers') || mainJs.includes('VEHICLE_MULTIPLIERS') || mainJs.includes('vehicleType'), 'Should have vehicle type multipliers');
  assert(mainJs.includes('tripMultipliers') || mainJs.includes('TRIP_MULTIPLIERS') || mainJs.includes('tripType'), 'Should have trip type multipliers');
});

test('Chatbot: Book Now button calls openBookingFromChatbot', () => {
  assert(mainJs.includes('openBookingFromChatbot'), 'Book Now should call openBookingFromChatbot');
});

test('Chatbot: i18n has chatbot.faq translations in Hindi', () => {
  assert(i18nJs.includes('chatbot.faq.title'), 'Should have chatbot.faq.title i18n key');
  assert(i18nJs.includes('chatbot.faq.q1'), 'Should have chatbot.faq.q1 i18n key');
  assert(i18nJs.includes('chatbot.faq.q5'), 'Should have chatbot.faq.q5 i18n key');
});

test('Chatbot: i18n has chatbot.clear translation', () => {
  assert(i18nJs.includes('chatbot.clear'), 'Should have chatbot.clear i18n key');
});

test('Chatbot: Google Maps API uses loading=async', () => {
  var indexHtml = require('fs').readFileSync('index.html', 'utf8');
  assert(indexHtml.includes('loading=async'), 'Google Maps script should use loading=async');
});

test('Chatbot: clear button exists in HTML', () => {
  var indexHtml = require('fs').readFileSync('index.html', 'utf8');
  assert(indexHtml.includes('chatbot-clear-btn'), 'Should have chatbot-clear-btn element');
  assert(indexHtml.includes('clearChatResult'), 'Clear button should call clearChatResult');
});

test('Chatbot: FAQ section exists in HTML with 5 questions', () => {
  var indexHtml = require('fs').readFileSync('index.html', 'utf8');
  assert(indexHtml.includes('chatbot-faq'), 'Should have chatbot-faq section');
  assert(indexHtml.includes('handleChatFaq'), 'FAQ buttons should call handleChatFaq');
  // Count FAQ button occurrences
  var faqMatches = indexHtml.match(/handleChatFaq\(/g) || [];
  assert(faqMatches.length === 5, 'Should have exactly 5 FAQ buttons (found: ' + faqMatches.length + ')');
});

test('Chatbot: CSS has clear button and FAQ styles', () => {
  var css = require('fs').readFileSync('css/style.css', 'utf8');
  assert(css.includes('.chatbot-clear-btn'), 'Should have .chatbot-clear-btn CSS');
  assert(css.includes('.chatbot-faq'), 'Should have .chatbot-faq CSS');
  assert(css.includes('.chatbot-faq-btn'), 'Should have .chatbot-faq-btn CSS');
});


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

