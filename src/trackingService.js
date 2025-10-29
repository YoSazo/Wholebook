// Generate unique ID
const generateUUID = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

// Cookie helpers
const setCookie = (name, value, days) => {
  let expires = "";
  if (days) {
    const date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    expires = "; expires=" + date.toUTCString();
  }
  document.cookie = name + "=" + (value || "") + expires + "; path=/";
};

const getCookie = (name) => {
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  return match ? match[2] : null;
};

// Get or create external ID
const getExternalId = () => {
  let externalId = getCookie('external_id');
  if (!externalId) {
    externalId = `extid.${Date.now()}.${generateUUID()}`;
    setCookie('external_id', externalId, 365);
  }
  return externalId;
};

// Get Facebook click ID from URL
const getFbclid = () => {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get('fbclid');
};

// Get or create FBC (Facebook Click ID cookie)
const getFbc = () => {
  let fbc = getCookie('_fbc');
  if (!fbc) {
    const fbclid = getFbclid();
    if (fbclid) {
      fbc = `fb.1.${Date.now()}.${fbclid}`;
      setCookie('_fbc', fbc, 90);
    }
  }
  return fbc;
};

// Get or create FBP (Facebook Browser ID)
const getFbp = () => {
  let fbp = getCookie('_fbp');
  if (!fbp) {
    fbp = `fb.1.${Date.now()}.${Math.random().toString(36).substring(7)}`;
    setCookie('_fbp', fbp, 90);
  }
  return fbp;
};

// Hash function for PII (Meta requirement)
const hashSHA256 = async (text) => {
  if (!text) return '';
  const encoder = new TextEncoder();
  const data = encoder.encode(text.toLowerCase().trim());
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};

// Track page view
export const trackPageView = () => {
  // Initialize FBP and FBC
  getFbp();
  getFbc();
  
  if (typeof window.fbq === 'function') {
    window.fbq('track', 'PageView');
  }
  
  console.log('✅ Page view tracked');
};

// Main tracking function
export const trackBooking = async (bookingData) => {
  const eventTime = Math.floor(Date.now() / 1000);
  const eventId = `lead_${Date.now()}_${generateUUID()}`;

  // Hash PII data for Facebook
  const hashedEmail = await hashSHA256(bookingData.email);
  const hashedPhone = await hashSHA256(bookingData.phone.replace(/\D/g, ''));
  const hashedFirstName = await hashSHA256(bookingData.firstName);
  const hashedLastName = await hashSHA256(bookingData.lastName);

  // Payload for Google Calendar via Zapier
  const payload = {
    // Contact Info
    first_name: bookingData.firstName,
    last_name: bookingData.lastName,
    email: bookingData.email,
    phone: `+1${bookingData.phone.replace(/\D/g, '')}`, // Add +1 and remove formatting
    
    // Booking Details
    booking_date: bookingData.selectedDate,
    booking_time: bookingData.selectedTime,
    
    // Event metadata
    event_id: eventId,
    event_time: eventTime,
    source_url: window.location.href,
    
    // Facebook tracking data (for your CAPI integration)
    fbc: getFbc(),
    fbp: getFbp(),
    external_id: getExternalId(),
    user_agent: navigator.userAgent,
    
    // Hashed data for Facebook CAPI
    em_hash: hashedEmail,
    ph_hash: hashedPhone,
    fn_hash: hashedFirstName,
    ln_hash: hashedLastName,
  };

  // Send to Zapier for Google Calendar
  try {
    const response = await fetch('https://hooks.zapier.com/hooks/catch/23096608/uid9pnc/', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    
    if (response.ok) {
      console.log('✅ Booking sent to calendar successfully', payload);
    } else {
      console.error('❌ Calendar webhook failed:', response.status);
    }
  } catch (error) {
    console.error('❌ Error sending to calendar:', error);
  }

  // Also fire Meta Pixel if available
  if (typeof window.fbq === 'function') {
    window.fbq('track', 'Lead', {
      content_name: 'Strategy Call Booking',
    }, {
      eventID: eventId
    });
  }
};