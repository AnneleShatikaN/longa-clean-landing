
-- Add car_wash to the service_type_enum
ALTER TYPE service_type_enum ADD VALUE 'car_wash';

-- Insert Cleaning Academy modules
INSERT INTO public.learning_modules (service_type, title, description, youtube_url, notes, is_published, display_order) VALUES
('cleaning', 'Welcome to Longa & Professional Cleaning', 'Introduction to Longa platform, job processes, payment structure, and professional expectations as a cleaning service provider.', 'https://www.youtube.com/watch?v=8QdmPWD3VmI', 'What is Longa?
Longa is Namibia''s leading platform connecting clients with trusted cleaning professionals and other home service providers. Through our mobile app, clients can easily book cleaning services, and you get matched with jobs in your area.

How Jobs Work on Longa:
- Booking Process: Clients book through the Longa app and you receive instant notifications
- Job Types: Regular house cleaning, deep cleaning, office cleaning, move-in/move-out cleaning
- Duration: Most jobs range from 2-6 hours depending on property size and cleaning type
- Scheduling: Jobs can be one-time, weekly, bi-weekly, or monthly recurring bookings

Payment & Earnings:
- Payment Schedule: All completed jobs are paid weekly via bank transfer every Friday
- Rates: Competitive hourly rates based on job type and location
- Tips: Clients can add tips through the app which are included in your weekly payment
- Payment Confirmation: You''ll receive SMS confirmation when payment is processed

Professional Expectations:
As a Longa cleaning professional, you represent our brand. We expect:
- Punctuality: Arrive on time or communicate delays immediately
- Appearance: Clean, neat uniform or professional clothing
- Attitude: Friendly, respectful, and helpful demeanor
- Quality: Thorough cleaning that meets or exceeds client expectations
- Communication: Clear updates to clients and Longa admin when needed

Longa''s 3-Strike Conduct Policy:
- Strike 1: Warning and coaching for minor issues (late arrival, incomplete work)
- Strike 2: Temporary suspension and additional training required
- Strike 3: Permanent removal from the platform

Code of Conduct:
- Respect client property and privacy
- No use of personal phones during work hours
- Report any damages or concerns immediately
- Maintain confidentiality about client homes and belongings
- Follow all safety protocols', true, 1),

('cleaning', 'Basic Cleaning Essentials', 'Essential cleaning supplies, tools, and preparation checklist for professional cleaning jobs.', 'https://www.youtube.com/watch?v=8QdmPWD3VmI', 'Your Essential Cleaning Kit:
Every Longa cleaner should carry these basics:

Cleaning Cloths & Tools:
- Microfiber cloths (at least 6 pieces)
- Scrub brush and sponges
- Rubber gloves (multiple pairs)
- Mop and bucket
- Broom and dustpan
- Vacuum cleaner (if you have one)

Cleaning Products:
- All-purpose cleaner
- Glass cleaner
- Bathroom disinfectant
- Floor cleaner
- Toilet bowl cleaner
- Furniture polish

Additional Supplies:
- Trash bags
- Paper towels
- Toilet paper (backup)
- Fresh cleaning cloths
- First aid kit (basic)

What Clients Usually Provide vs. What You Bring:
Clients Typically Provide:
- Major appliances (vacuum, washing machine)
- Specialty cleaning products they prefer
- Additional supplies if requested in advance

You Should Always Bring:
- Basic cleaning kit (listed above)
- Professional attitude and expertise
- Backup supplies in case client runs out

Job Preparation Checklist:
Before leaving for any job:
✅ Clean, professional appearance
✅ Fully charged phone
✅ Complete cleaning kit packed
✅ Client address and contact confirmed
✅ Job details reviewed (time, special requests)
✅ Transportation arranged', true, 2),

('cleaning', 'Cleaning Routines for Every Room', 'Room-by-room cleaning procedures, techniques, and time-saving tips for professional results.', 'https://www.youtube.com/watch?v=lIJaA_FrLLw', 'The Golden Rule: Top to Bottom, Left to Right
Always clean from highest surfaces to lowest, and work systematically around each room to avoid missing spots or re-cleaning areas.

Kitchen Cleaning Routine:
1. Clear and organize - Remove items from counters and sink
2. Load dishwasher or wash dishes by hand
3. Wipe appliances - Microwave inside/out, coffee maker, toaster
4. Clean countertops - Use appropriate cleaner for surface type
5. Clean sink and faucet - Scrub and polish to shine
6. Sweep and mop floors - Get under appliances where possible
7. Take out trash and replace liner

Bathroom Cleaning Routine:
1. Spray disinfectant on all surfaces first
2. Clean toilet - Bowl, seat, base, and behind
3. Scrub shower/tub - Remove soap scum and mildew
4. Clean sink and faucet - Polish to shine
5. Wipe mirrors and glass - Use glass cleaner for streak-free finish
6. Sweep and mop floors - Get behind toilet and in corners
7. Replace towels if provided by client

Bedroom Cleaning Routine:
1. Make beds - Straighten sheets, fluff pillows
2. Dust furniture - Nightstands, dressers, lamps
3. Organize visible items - Don''t move personal belongings
4. Vacuum or sweep floors - Under beds if accessible
5. Empty trash bins if present

Living Room Cleaning Routine:
1. Tidy up - Arrange cushions, fold throws
2. Dust all surfaces - Tables, TV stands, decorations
3. Clean glass surfaces - TV screens, picture frames, windows
4. Vacuum upholstery if requested
5. Vacuum or sweep floors - Move light furniture if needed', true, 3),

('cleaning', 'Hygiene & Safety Practices', 'Personal hygiene standards, chemical safety, and physical safety protocols for professional cleaning.', 'https://www.youtube.com/watch?v=qgLfJlvvRjU', 'Personal Hygiene Standards:
Your appearance reflects on Longa''s brand and affects client confidence:

Dress Code:
- Clean, wrinkle-free clothing
- Closed-toe shoes with good grip
- Hair tied back or covered
- Minimal jewelry that won''t catch on surfaces
- Name tag or Longa uniform if provided

Personal Cleanliness:
- Shower and use deodorant before work
- Clean, trimmed fingernails
- Fresh breath (avoid strong foods before jobs)
- Wash hands frequently during work

Chemical Safety:
Before Using Any Product:
- Read labels carefully
- Check for client allergies or preferences
- Ensure adequate ventilation
- Never mix different cleaning chemicals

Proper Handling:
- Wear gloves when using strong cleaners
- Keep products away from children and pets
- Store chemicals in original containers
- Dispose of empty containers responsibly

Emergency Procedures:
- Know location of first aid kit
- Have emergency contact numbers
- Understand basic first aid for chemical exposure
- Report any accidents immediately to Longa admin

Physical Safety:
- Bend knees, not back when lifting
- Ask for help with heavy items
- Use proper ladder safety for high areas
- Wear non-slip shoes
- Keep sharp tools pointed away from body
- Unplug electrical equipment when cleaning', true, 4),

('cleaning', 'Client Etiquette & Communication', 'Professional communication, client interaction, and handling difficult situations.', 'https://www.youtube.com/watch?v=nvLCfNKnW0k', 'Professional Greetings and Introductions:
Upon Arrival:
- Ring doorbell or knock politely
- Introduce yourself: "Good morning, I''m [Name] from Longa cleaning services"
- Show your Longa ID if requested
- Confirm the job details and any special requests

Setting Expectations:
Before Starting Work:
- Walk through the areas to be cleaned with the client
- Confirm estimated completion time
- Ask about any areas to avoid or special instructions
- Inquire about pets or children in the home
- Verify access to supplies and utilities

During the Job Communication Best Practices:
- Work quietly and respectfully
- Ask permission before moving valuable items
- Keep client informed of your progress
- Report any issues or concerns immediately
- Maintain professional boundaries

Handling Difficult Situations:
If Something Breaks:
1. Stop work immediately
2. Inform the client honestly and apologetically
3. Take photos if necessary
4. Contact Longa admin via WhatsApp: +264 XX XXX XXXX
5. Document the incident for insurance purposes

If Client is Unsatisfied:
1. Listen carefully to their concerns
2. Apologize sincerely
3. Offer to correct the issue if possible
4. Remain calm and professional
5. Contact Longa admin for guidance
6. Never argue or become defensive

Emergency Contacts:
- Longa Admin WhatsApp: +264 XX XXX XXXX
- Longa Emergency Line: +264 XX XXX XXXX', true, 5),

('cleaning', 'Wrapping Up a Job', 'Quality control checklist, professional completion process, and post-job requirements.', 'https://www.youtube.com/watch?v=nvLCfNKnW0k', 'Quality Control Checklist:
Before considering the job complete, systematically check:

Kitchen:
✅ Counters wiped and cleared
✅ Sink cleaned and shining
✅ Appliances cleaned inside and out
✅ Floor swept and mopped
✅ Trash emptied

Bathrooms:
✅ Toilet cleaned thoroughly
✅ Shower/tub scrubbed
✅ Sink and faucet polished
✅ Mirror streak-free
✅ Floor cleaned and dried

Bedrooms:
✅ Beds made neatly
✅ Surfaces dusted
✅ Floors vacuumed/swept
✅ Trash emptied if applicable

Living Areas:
✅ Furniture dusted and arranged
✅ Floors cleaned thoroughly
✅ Glass surfaces spotless

Professional Completion Process:
Final Walkthrough:
1. Do a complete walkthrough of all cleaned areas
2. Check for missed spots or streaks
3. Ensure all your supplies are packed
4. Return any moved items to original positions
5. Turn off any lights or equipment you used

Client Communication:
- Inform the client you''ve finished
- Invite them to do a walkthrough if they wish
- Address any immediate concerns
- Thank them for choosing Longa
- Confirm they''re satisfied with the service

Post-Job Requirements:
After Each Job:
- Update job status in the Longa app
- Take before/after photos if requested
- Submit any expense receipts
- Report any issues or client feedback to admin
- Prepare for your next appointment', true, 6);

-- Insert quiz questions for cleaning modules
INSERT INTO public.quiz_questions (module_id, question_text, option_a, option_b, option_c, option_d, correct_answer, explanation, question_order) 
SELECT 
  lm.id,
  'What is Longa''s payment schedule for completed jobs?',
  'Daily payments via mobile money',
  'Weekly payments every Friday via bank transfer',
  'Monthly payments at the end of each month',
  'Payment immediately after each job',
  'B',
  'Longa pays all completed jobs weekly every Friday via bank transfer to ensure reliable income for providers.',
  1
FROM learning_modules lm WHERE lm.service_type = 'cleaning' AND lm.title = 'Welcome to Longa & Professional Cleaning';

INSERT INTO public.quiz_questions (module_id, question_text, option_a, option_b, option_c, option_d, correct_answer, explanation, question_order) 
SELECT 
  lm.id,
  'What should you do if you accidentally break something in a client''s home?',
  'Try to fix it yourself and don''t mention it',
  'Tell the client it was already broken',
  'Inform the client immediately, apologize, and contact Longa admin',
  'Finish the job and report it later',
  'C',
  'Honesty and immediate communication are essential for maintaining trust and following proper insurance procedures.',
  2
FROM learning_modules lm WHERE lm.service_type = 'cleaning' AND lm.title = 'Client Etiquette & Communication';

-- Add more quiz questions distributed across modules
INSERT INTO public.quiz_questions (module_id, question_text, option_a, option_b, option_c, option_d, correct_answer, explanation, question_order) 
SELECT 
  lm.id,
  'According to Longa''s 3-strike policy, what happens after the second strike?',
  'Immediate removal from the platform',
  'A written warning only',
  'Temporary suspension and additional training required',
  'Reduction in hourly pay',
  'C',
  'The second strike results in temporary suspension and mandatory additional training to help providers improve.',
  1
FROM learning_modules lm WHERE lm.service_type = 'cleaning' AND lm.title = 'Welcome to Longa & Professional Cleaning';

INSERT INTO public.quiz_questions (module_id, question_text, option_a, option_b, option_c, option_d, correct_answer, explanation, question_order) 
SELECT 
  lm.id,
  'When cleaning a house, what is the recommended order?',
  'Bottom to top, right to left',
  'Top to bottom, left to right',
  'Random order based on preference',
  'Bathrooms first, then kitchen, then bedrooms',
  'B',
  'Cleaning from top to bottom prevents dirt from falling on already cleaned surfaces, and left to right ensures systematic coverage.',
  1
FROM learning_modules lm WHERE lm.service_type = 'cleaning' AND lm.title = 'Cleaning Routines for Every Room';

INSERT INTO public.quiz_questions (module_id, question_text, option_a, option_b, option_c, option_d, correct_answer, explanation, question_order) 
SELECT 
  lm.id,
  'Which items should you ALWAYS bring to every cleaning job?',
  'Only cleaning products, clients provide tools',
  'Only tools, clients provide cleaning products',
  'Basic cleaning kit including cloths, gloves, and essential products',
  'Nothing, clients provide everything',
  'C',
  'Professional cleaners should always bring their basic cleaning kit to ensure they can complete the job regardless of what clients provide.',
  1
FROM learning_modules lm WHERE lm.service_type = 'cleaning' AND lm.title = 'Basic Cleaning Essentials';

INSERT INTO public.quiz_questions (module_id, question_text, option_a, option_b, option_c, option_d, correct_answer, explanation, question_order) 
SELECT 
  lm.id,
  'What is the most important safety rule when using cleaning chemicals?',
  'Use as much product as possible for better results',
  'Mix different chemicals for stronger cleaning power',
  'Never mix chemicals and ensure adequate ventilation',
  'Only use hot water with all cleaning products',
  'C',
  'Mixing chemicals can create dangerous reactions, and proper ventilation prevents inhalation of harmful fumes.',
  1
FROM learning_modules lm WHERE lm.service_type = 'cleaning' AND lm.title = 'Hygiene & Safety Practices';

INSERT INTO public.quiz_questions (module_id, question_text, option_a, option_b, option_c, option_d, correct_answer, explanation, question_order) 
SELECT 
  lm.id,
  'Before leaving a completed job, you should:',
  'Leave immediately to get to the next job faster',
  'Do a quality walkthrough and invite client feedback',
  'Only clean areas specifically mentioned by the client',
  'Ask the client to inspect and sign a completion form',
  'B',
  'A final walkthrough ensures quality standards are met and allows clients to provide immediate feedback if needed.',
  1
FROM learning_modules lm WHERE lm.service_type = 'cleaning' AND lm.title = 'Wrapping Up a Job';
