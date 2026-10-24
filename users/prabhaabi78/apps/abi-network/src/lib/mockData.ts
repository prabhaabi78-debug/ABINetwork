// Mock data for demo mode (no Supabase required)

export const MOCK_CHANNELS = [
  { id: '1', name: 'Sun TV HD', logo_url: null, category: 'Entertainment', stream_url: 'https://example.com/streams/suntv_hd.m3u8', is_active: true, sort_order: 1, created_at: new Date().toISOString() },
  { id: '2', name: 'Zee Tamil HD', logo_url: null, category: 'Entertainment', stream_url: 'https://example.com/streams/zeetamil_hd.m3u8', is_active: true, sort_order: 2, created_at: new Date().toISOString() },
  { id: '3', name: 'Vijay TV HD', logo_url: null, category: 'Entertainment', stream_url: 'https://example.com/streams/vijaytv_hd.m3u8', is_active: true, sort_order: 3, created_at: new Date().toISOString() },
  { id: '4', name: 'Jaya TV HD', logo_url: null, category: 'Entertainment', stream_url: 'https://example.com/streams/jayatv_hd.m3u8', is_active: true, sort_order: 4, created_at: new Date().toISOString() },
  { id: '5', name: 'Polimer TV', logo_url: null, category: 'Entertainment', stream_url: 'https://example.com/streams/polimertv.m3u8', is_active: true, sort_order: 5, created_at: new Date().toISOString() },
  { id: '6', name: 'Thanthi TV', logo_url: null, category: 'News', stream_url: 'https://example.com/streams/thanthitv.m3u8', is_active: true, sort_order: 6, created_at: new Date().toISOString() },
  { id: '7', name: 'Puthiya Thalaimurai', logo_url: null, category: 'News', stream_url: 'https://example.com/streams/puthiyathalaimurai.m3u8', is_active: true, sort_order: 7, created_at: new Date().toISOString() },
  { id: '8', name: 'Seithigal TV', logo_url: null, category: 'News', stream_url: 'https://example.com/streams/seithigaltv.m3u8', is_active: true, sort_order: 8, created_at: new Date().toISOString() },
  { id: '9', name: 'Raj TV', logo_url: null, category: 'Movies', stream_url: 'https://example.com/streams/rajtv.m3u8', is_active: true, sort_order: 9, created_at: new Date().toISOString() },
  { id: '10', name: 'KTV', logo_url: null, category: 'Movies', stream_url: 'https://example.com/streams/ktv.m3u8', is_active: true, sort_order: 10, created_at: new Date().toISOString() },
  { id: '11', name: 'Sun Music HD', logo_url: null, category: 'Music', stream_url: 'https://example.com/streams/sunmusic_hd.m3u8', is_active: true, sort_order: 11, created_at: new Date().toISOString() },
  { id: '12', name: 'Isaiaruvi', logo_url: null, category: 'Music', stream_url: 'https://example.com/streams/isaiaruvi.m3u8', is_active: true, sort_order: 12, created_at: new Date().toISOString() },
  { id: '13', name: 'Chutti TV', logo_url: null, category: 'Kids', stream_url: 'https://example.com/streams/chuttitv.m3u8', is_active: true, sort_order: 13, created_at: new Date().toISOString() },
  { id: '14', name: 'Sri Sankara', logo_url: null, category: 'Devotional', stream_url: 'https://example.com/streams/srisankara.m3u8', is_active: true, sort_order: 14, created_at: new Date().toISOString() },
  { id: '15', name: 'Makkal TV', logo_url: null, category: 'Entertainment', stream_url: 'https://example.com/streams/makkaltv.m3u8', is_active: true, sort_order: 15, created_at: new Date().toISOString() },
  { id: '16', name: 'Captain TV', logo_url: null, category: 'Entertainment', stream_url: 'https://example.com/streams/captaintv.m3u8', is_active: true, sort_order: 16, created_at: new Date().toISOString() },
];

export const MOCK_CUSTOMERS = [
  { id: 'cust-1', email: 'customer1@example.com', full_name: 'Rajesh Kumar', phone: '+91 98765 43210', role: 'customer' as const, status: 'active' as const, created_at: new Date().toISOString() },
  { id: 'cust-2', email: 'customer2@example.com', full_name: 'Priya Sharma', phone: '+91 87654 32109', role: 'customer' as const, status: 'active' as const, created_at: new Date().toISOString() },
  { id: 'cust-3', email: 'customer3@example.com', full_name: 'Karthik Rajan', phone: '+91 76543 21098', role: 'customer' as const, status: 'suspended' as const, created_at: new Date().toISOString() },
];

export const MOCK_SUBSCRIPTIONS = [
  { id: 'sub-1', customer_id: 'cust-1', plan_name: 'Monthly', start_date: '2026-01-01', expiry_date: '2026-12-31', status: 'active' as const, payment_id: 'pay-1', created_at: new Date().toISOString() },
  { id: 'sub-2', customer_id: 'cust-2', plan_name: 'Yearly', start_date: '2026-01-01', expiry_date: '2026-12-31', status: 'active' as const, payment_id: 'pay-2', created_at: new Date().toISOString() },
];

export const MOCK_PAYMENTS = [
  { id: 'pay-1', customer_id: 'cust-1', amount: 299, method: 'UPI', reference: 'UPI123456', paid_at: new Date().toISOString(), notes: null, created_at: new Date().toISOString() },
  { id: 'pay-2', customer_id: 'cust-2', amount: 2999, method: 'Bank Transfer', reference: 'TXN789012', paid_at: new Date().toISOString(), notes: 'Annual subscription', created_at: new Date().toISOString() },
];
