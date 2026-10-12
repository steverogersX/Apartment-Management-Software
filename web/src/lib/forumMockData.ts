import { z } from "zod";

import { residents } from "./residentsMockData";
import { attachmentSchema, type Attachment } from "./attachmentTypes";

export type ForumCategory =
  "General" | "Suggestions" | "Maintenance Feedback" | "Events" | "Marketplace";

export const FORUM_CATEGORIES: ForumCategory[] = [
  "General",
  "Suggestions",
  "Maintenance Feedback",
  "Events",
  "Marketplace",
];

export const SUGGESTED_FORUM_TAGS = [
  "question",
  "suggestion",
  "urgent",
  "help-needed",
  "idea",
  "resolved",
  "buy-sell",
  "recommendation",
];

export type ForumThread = {
  id: string;
  title: string;
  body: string;
  category: ForumCategory;
  tags?: string[];
  attachments?: Attachment[];
  authorName: string;
  authorFlat: string;
  postedAt: string;
  lastActivityAt: string;
  replyCount: number;
  upvotedBy: string[];
  pinned: boolean;
  locked: boolean;
};

export type ForumReply = {
  id: string;
  threadId: string;
  parentReplyId?: string | null;
  authorName: string;
  authorFlat: string;
  postedAt: string;
  body: string;
  attachments?: Attachment[];
  upvotedBy: string[];
};

export const forumThreadFormSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  body: z.string().min(10, "Body must be at least 10 characters"),
  category: z.enum(["General", "Suggestions", "Maintenance Feedback", "Events", "Marketplace"]),
  tags: z.array(z.string()).optional(),
  attachments: z.array(attachmentSchema).optional(),
});

export type ForumThreadFormInput = z.infer<typeof forumThreadFormSchema>;

function flatFor(name: string): string {
  const r = residents.find((x) => x.name === name);
  return r ? `${r.tower}-${r.flatNumber}` : "A-301";
}

const rawThreads: Omit<ForumThread, "replyCount" | "lastActivityAt">[] = [
  {
    id: "thread-1",
    title: "Water pressure low in Block B – anyone else facing this?",
    body: "Since yesterday morning the water pressure in Block B (especially 2nd and 3rd floor) has been noticeably low. Is this related to the tank cleaning scheduled for next week or is there a separate issue? Please share if you're affected so we can raise a collective complaint.",
    category: "Maintenance Feedback",
    tags: ["urgent", "question"],
    authorName: "Sunita Patil",
    authorFlat: flatFor("Sunita Patil"),
    postedAt: "2026-06-19T08:30:00+05:30",
    upvotedBy: ["Arvind Deshmukh", "Rohan Mehta", "Divya Reddy"],
    pinned: false,
    locked: false,
  },
  {
    id: "thread-2",
    title: "Selling gently used treadmill – barely used, 1 year old",
    body: "We are moving and need to sell our PowerMax treadmill (purchased Jan 2025, used <20 times). Condition is excellent, still under warranty. Original price ₹32k, asking ₹18k negotiable. DM or reply if interested. Can arrange viewing in A-502 this weekend.",
    category: "Marketplace",
    tags: ["buy-sell", "fitness"],
    attachments: [
      {
        name: "treadmill-photo.jpg",
        url: "https://picsum.photos/seed/thread-2-treadmill/800/500",
        type: "image" as const,
        size: "1.1 MB",
      },
    ],
    authorName: "Rohan Mehta",
    authorFlat: flatFor("Rohan Mehta"),
    postedAt: "2026-06-18T14:00:00+05:30",
    upvotedBy: ["Mohammed Farhan"],
    pinned: false,
    locked: false,
  },
  {
    id: "thread-3",
    title: "Society garden clean-up drive this Saturday 7 AM – volunteers needed",
    body: "The estate team is organizing a garden clean-up drive this Saturday 7 AM near the clubhouse. We need ~10 volunteers to help with weeding and planting new saplings. Tea and snacks will be provided. Please reply if you can join. Let's make our society greener together!",
    category: "Events",
    tags: ["idea", "help-needed"],
    authorName: "Ananya Gupta",
    authorFlat: flatFor("Ananya Gupta"),
    postedAt: "2026-06-17T09:00:00+05:30",
    upvotedBy: [
      "Arvind Deshmukh",
      "Kavya Nair",
      "Suresh Iyer",
      "Divya Reddy",
      "Vikram Singh Rathore",
    ],
    pinned: true,
    locked: false,
  },
  {
    id: "thread-4",
    title: "Proposal: Install CCTV in parking lot – seeking feedback",
    body: "Following a couple of minor incidents in the parking area, several residents suggested installing additional CCTV cameras covering the B and C parking slots. I've collected a quote of ~₹45k for 4 cameras with night vision and 30-day backup. Share your thoughts – is this worth proposing at the next AGM? Pros/cons welcome.",
    category: "Suggestions",
    tags: ["suggestion", "question"],
    attachments: [
      { name: "CCTV-Quote.pdf", url: "/mock/cctv-quote.pdf", type: "pdf" as const, size: "410 KB" },
    ],
    authorName: "Vikram Singh Rathore",
    authorFlat: flatFor("Vikram Singh Rathore"),
    postedAt: "2026-06-16T10:15:00+05:30",
    upvotedBy: [
      "Suresh Iyer",
      "Arvind Deshmukh",
      "Mohammed Farhan",
      "Pooja Banerjee",
      "Harish Krishnan",
    ],
    pinned: true,
    locked: false,
  },
  {
    id: "thread-5",
    title: "Lost keys near clubhouse – black keychain with 3 keys",
    body: "Lost a set of keys near the clubhouse yesterday evening (~6 PM). Black keychain with 3 keys (one Yale, two Godrej) and a small blue tag. If anyone found them please contact Kavya Nair, C-103 or reply here. Reward for finder!",
    category: "General",
    tags: ["urgent", "help-needed"],
    authorName: "Kavya Nair",
    authorFlat: flatFor("Kavya Nair"),
    postedAt: "2026-06-15T19:30:00+05:30",
    upvotedBy: [],
    pinned: false,
    locked: false,
  },
  {
    id: "thread-6",
    title: "Maids and cooks contact list – share recommendations",
    body: "Many new families have moved in and are looking for reliable maids/cooks. Let's crowdsource a list of trusted help we have used. Please reply with name, contact, specialty (cooking/cleaning) and your flat for reference. I'll compile and share a sheet by next week.",
    category: "General",
    tags: ["recommendation", "question"],
    authorName: "Pooja Banerjee",
    authorFlat: flatFor("Pooja Banerjee"),
    postedAt: "2026-06-14T11:00:00+05:30",
    upvotedBy: ["Divya Reddy", "Sunita Patil", "Harish Krishnan"],
    pinned: false,
    locked: false,
  },
  {
    id: "thread-7",
    title: "Elevator in C-307 tower – recurring malfunction, need permanent fix",
    body: "The lift in C tower (near flat 307) has malfunctioned 3 times in the last 2 months. The AMC vendor does a temporary fix each time but the issue returns. Can the maintenance committee look into a permanent solution or consider replacing the vendor? This is a safety concern.",
    category: "Maintenance Feedback",
    tags: ["urgent", "resolved"],
    authorName: "Suresh Iyer",
    authorFlat: flatFor("Suresh Iyer"),
    postedAt: "2026-06-13T16:45:00+05:30",
    upvotedBy: ["Harish Krishnan", "Kavya Nair", "Neha Kulkarni"],
    pinned: false,
    locked: true,
  },
  {
    id: "thread-8",
    title: "Diwali potluck – who's bringing what? Let's coordinate",
    body: "For the Diwali decoration event, let's also do a potluck on the same evening. I've created a simple sheet – please reply with your dish (veg/non-veg, approx quantity) and any dietary notes. Looking forward to a great community dinner! Organizers: Divya Reddy, Ananya Gupta.",
    category: "Events",
    tags: ["idea", "question"],
    authorName: "Divya Reddy",
    authorFlat: flatFor("Divya Reddy"),
    postedAt: "2026-06-12T10:00:00+05:30",
    upvotedBy: ["Ananya Gupta", "Pooja Banerjee"],
    pinned: false,
    locked: false,
  },
  {
    id: "thread-9",
    title: "Noise from renovation in A-601 after 7 PM – request to follow rules",
    body: "Hi, there has been drilling and hammering noise from A-601 well past 7 PM (society rules allow renovation only 10 AM – 6 PM). Request the resident/contractor to kindly adhere to timings – it's disturbing for elders and kids studying. No hard feelings, just a gentle reminder.",
    category: "General",
    tags: ["question", "urgent"],
    authorName: "Arvind Deshmukh",
    authorFlat: flatFor("Arvind Deshmukh"),
    postedAt: "2026-06-11T18:00:00+05:30",
    upvotedBy: ["Rohan Mehta", "Sunita Patil"],
    pinned: false,
    locked: false,
  },
  {
    id: "thread-10",
    title: "Gym equipment maintenance – broken cross-trainer and loose dumbbells",
    body: "The cross-trainer in the gym has a broken pedal and a couple of dumbbell racks are loose. I reported via Help Desk but posting here for visibility. Has anyone else notified? Let's follow up together so it gets fixed before the AGM.",
    category: "Maintenance Feedback",
    tags: ["help-needed", "suggestion"],
    authorName: "Mohammed Farhan",
    authorFlat: flatFor("Mohammed Farhan"),
    postedAt: "2026-06-10T07:30:00+05:30",
    upvotedBy: ["Suresh Iyer"],
    pinned: false,
    locked: false,
  },
];

export const forumReplies: ForumReply[] = [
  // thread-1: 3 replies
  {
    id: "reply-1-1",
    threadId: "thread-1",
    authorName: "Divya Reddy",
    authorFlat: flatFor("Divya Reddy"),
    postedAt: "2026-06-19T09:15:00+05:30",
    body: "Yes, facing same issue in B-201 since yesterday. Pressure is almost half. Let's raise a ticket together.",
    upvotedBy: ["Sunita Patil"],
  },
  {
    id: "reply-1-2",
    threadId: "thread-1",
    authorName: "Mohammed Farhan",
    authorFlat: flatFor("Mohammed Farhan"),
    postedAt: "2026-06-19T10:05:00+05:30",
    body: "Confirmed in B-405 as well. I checked with the plumber – he said a valve near the terrace was partially closed. Should be fixed by evening.",
    attachments: [
      {
        name: "valve-photo.jpg",
        url: "https://picsum.photos/seed/reply-1-2-valve/700/450",
        type: "image" as const,
        size: "820 KB",
      },
    ],
    upvotedBy: ["Sunita Patil", "Divya Reddy"],
  },
  {
    id: "reply-1-3",
    threadId: "thread-1",
    parentReplyId: "reply-1-2",
    authorName: "Arvind Deshmukh",
    authorFlat: flatFor("Arvind Deshmukh"),
    postedAt: "2026-06-19T11:20:00+05:30",
    body: "Thanks for the update, Farhan. Let's monitor till evening and escalate if not resolved.",
    upvotedBy: [],
  },
  {
    id: "reply-1-4",
    threadId: "thread-1",
    parentReplyId: "reply-1-3",
    authorName: "Divya Reddy",
    authorFlat: flatFor("Divya Reddy"),
    postedAt: "2026-06-19T11:45:00+05:30",
    body: "Agreed, I'll check back by 6 PM and update the thread.",
    upvotedBy: ["Arvind Deshmukh"],
  },
  // thread-2: 1 reply
  {
    id: "reply-2-1",
    threadId: "thread-2",
    authorName: "Harish Krishnan",
    authorFlat: flatFor("Harish Krishnan"),
    postedAt: "2026-06-18T18:45:00+05:30",
    body: "Interested! Can I come see it Sunday 11 AM? Please share your contact.",
    upvotedBy: ["Rohan Mehta"],
  },
  // thread-3: 4 replies
  {
    id: "reply-3-1",
    threadId: "thread-3",
    authorName: "Suresh Iyer",
    authorFlat: flatFor("Suresh Iyer"),
    postedAt: "2026-06-17T11:30:00+05:30",
    body: "Count me in! I can bring gardening tools.",
    upvotedBy: ["Ananya Gupta"],
  },
  {
    id: "reply-3-2",
    threadId: "thread-3",
    authorName: "Kavya Nair",
    authorFlat: flatFor("Kavya Nair"),
    postedAt: "2026-06-17T12:15:00+05:30",
    body: "I'll join with my daughter. Great initiative!",
    upvotedBy: [],
  },
  {
    id: "reply-3-3",
    threadId: "thread-3",
    authorName: "Divya Reddy",
    authorFlat: flatFor("Divya Reddy"),
    postedAt: "2026-06-17T15:00:00+05:30",
    body: "We have saplings sponsored by the society – will distribute on the day.",
    upvotedBy: ["Ananya Gupta", "Suresh Iyer"],
  },
  {
    id: "reply-3-4",
    threadId: "thread-3",
    authorName: "Pooja Banerjee",
    authorFlat: flatFor("Pooja Banerjee"),
    postedAt: "2026-06-17T16:20:00+05:30",
    body: "Can we also clean the pathway near C block?",
    upvotedBy: [],
  },
  {
    id: "reply-3-5",
    threadId: "thread-3",
    parentReplyId: "reply-3-4",
    authorName: "Ananya Gupta",
    authorFlat: flatFor("Ananya Gupta"),
    postedAt: "2026-06-17T16:40:00+05:30",
    body: "Great idea, let's add that to the list!",
    upvotedBy: ["Suresh Iyer"],
  },
  {
    id: "reply-3-6",
    threadId: "thread-3",
    parentReplyId: "reply-3-5",
    authorName: "Suresh Iyer",
    authorFlat: flatFor("Suresh Iyer"),
    postedAt: "2026-06-17T17:10:00+05:30",
    body: "I can help with the C block pathway too.",
    upvotedBy: [],
  },
  // thread-4: 6 replies (most)
  {
    id: "reply-4-1",
    threadId: "thread-4",
    authorName: "Arvind Deshmukh",
    authorFlat: flatFor("Arvind Deshmukh"),
    postedAt: "2026-06-16T12:30:00+05:30",
    body: "Good proposal. I think 45k is reasonable for 4 cameras. Let's get 2 more quotes to compare.",
    upvotedBy: ["Vikram Singh Rathore", "Suresh Iyer"],
  },
  {
    id: "reply-4-10",
    threadId: "thread-4",
    parentReplyId: "reply-4-1",
    authorName: "Vikram Singh Rathore",
    authorFlat: flatFor("Vikram Singh Rathore"),
    postedAt: "2026-06-16T12:50:00+05:30",
    body: "Already got one — SecureVision quoted ₹38k for 4 cameras with the same specs.",
    upvotedBy: ["Arvind Deshmukh", "Suresh Iyer", "Divya Reddy"],
  },
  {
    id: "reply-4-11",
    threadId: "thread-4",
    parentReplyId: "reply-4-10",
    authorName: "Suresh Iyer",
    authorFlat: flatFor("Suresh Iyer"),
    postedAt: "2026-06-16T13:05:00+05:30",
    body: "That's cheaper. What's the warranty and AMC terms on that one?",
    upvotedBy: [],
  },
  {
    id: "reply-4-12",
    threadId: "thread-4",
    parentReplyId: "reply-4-11",
    authorName: "Vikram Singh Rathore",
    authorFlat: flatFor("Vikram Singh Rathore"),
    postedAt: "2026-06-16T13:20:00+05:30",
    body: "2 years onsite warranty, AMC ₹4k/year after that. I'll share the full quote PDF in the office group.",
    upvotedBy: ["Suresh Iyer"],
  },
  {
    id: "reply-4-13",
    threadId: "thread-4",
    parentReplyId: "reply-4-12",
    authorName: "Arvind Deshmukh",
    authorFlat: flatFor("Arvind Deshmukh"),
    postedAt: "2026-06-16T13:30:00+05:30",
    body: "Sounds good, let's shortlist SecureVision alongside the original quote and decide at AGM.",
    upvotedBy: ["Vikram Singh Rathore", "Suresh Iyer"],
  },
  {
    id: "reply-4-2",
    threadId: "thread-4",
    authorName: "Suresh Iyer",
    authorFlat: flatFor("Suresh Iyer"),
    postedAt: "2026-06-16T13:45:00+05:30",
    body: "Support this. My car had a minor scratch last month, CCTV would help.",
    upvotedBy: ["Vikram Singh Rathore"],
  },
  {
    id: "reply-4-9",
    threadId: "thread-4",
    parentReplyId: "reply-4-2",
    authorName: "Mohammed Farhan",
    authorFlat: flatFor("Mohammed Farhan"),
    postedAt: "2026-06-16T14:10:00+05:30",
    body: "Which spot got scratched? Might be worth flagging to security separately too.",
    upvotedBy: [],
  },
  {
    id: "reply-4-3",
    threadId: "thread-4",
    authorName: "Pooja Banerjee",
    authorFlat: flatFor("Pooja Banerjee"),
    postedAt: "2026-06-16T15:00:00+05:30",
    body: "Can we ensure data privacy – who will have access to footage?",
    upvotedBy: ["Mohammed Farhan"],
  },
  {
    id: "reply-4-7",
    threadId: "thread-4",
    parentReplyId: "reply-4-3",
    authorName: "Vikram Singh Rathore",
    authorFlat: flatFor("Vikram Singh Rathore"),
    postedAt: "2026-06-16T15:20:00+05:30",
    body: "Good question — access will be restricted to the committee only, with an audit log of every view.",
    upvotedBy: ["Pooja Banerjee", "Suresh Iyer"],
  },
  {
    id: "reply-4-8",
    threadId: "thread-4",
    parentReplyId: "reply-4-7",
    authorName: "Pooja Banerjee",
    authorFlat: flatFor("Pooja Banerjee"),
    postedAt: "2026-06-16T15:35:00+05:30",
    body: "That works, thanks for clarifying!",
    upvotedBy: [],
  },
  {
    id: "reply-4-4",
    threadId: "thread-4",
    authorName: "Mohammed Farhan",
    authorFlat: flatFor("Mohammed Farhan"),
    postedAt: "2026-06-16T16:20:00+05:30",
    body: "Maybe we should also cover the main gate. Could be extra cost.",
    upvotedBy: [],
  },
  {
    id: "reply-4-14",
    threadId: "thread-4",
    parentReplyId: "reply-4-4",
    authorName: "Sunita Patil",
    authorFlat: flatFor("Sunita Patil"),
    postedAt: "2026-06-16T16:35:00+05:30",
    body: "Main gate already has a camera from last year's install, so that's covered already.",
    upvotedBy: ["Vikram Singh Rathore"],
  },
  {
    id: "reply-4-15",
    threadId: "thread-4",
    parentReplyId: "reply-4-14",
    authorName: "Mohammed Farhan",
    authorFlat: flatFor("Mohammed Farhan"),
    postedAt: "2026-06-16T16:50:00+05:30",
    body: "Oh good, didn't know that — thanks for confirming.",
    upvotedBy: [],
  },
  {
    id: "reply-4-5",
    threadId: "thread-4",
    authorName: "Divya Reddy",
    authorFlat: flatFor("Divya Reddy"),
    postedAt: "2026-06-16T17:10:00+05:30",
    body: "Happy to contribute if we crowdsource. Let's discuss at AGM.",
    upvotedBy: ["Vikram Singh Rathore"],
  },
  {
    id: "reply-4-16",
    threadId: "thread-4",
    parentReplyId: "reply-4-5",
    authorName: "Harish Krishnan",
    authorFlat: flatFor("Harish Krishnan"),
    postedAt: "2026-06-16T17:25:00+05:30",
    body: "+1, let's add it as a formal AGM agenda item so it's on record.",
    upvotedBy: ["Divya Reddy"],
  },
  {
    id: "reply-4-17",
    threadId: "thread-4",
    parentReplyId: "reply-4-16",
    authorName: "Vikram Singh Rathore",
    authorFlat: flatFor("Vikram Singh Rathore"),
    postedAt: "2026-06-16T17:40:00+05:30",
    body: "Done, I'll add it to the AGM agenda. Thanks everyone for the inputs so far!",
    upvotedBy: ["Arvind Deshmukh", "Harish Krishnan", "Divya Reddy"],
  },
  {
    id: "reply-4-6",
    threadId: "thread-4",
    authorName: "Sunita Patil",
    authorFlat: flatFor("Sunita Patil"),
    postedAt: "2026-06-16T18:00:00+05:30",
    body: "The current society funds can cover this if we prioritize. Secretary, please advise.",
    upvotedBy: ["Arvind Deshmukh", "Vikram Singh Rathore"],
  },
  {
    id: "reply-4-18",
    threadId: "thread-4",
    authorName: "Kavya Nair",
    authorFlat: flatFor("Kavya Nair"),
    postedAt: "2026-06-16T18:20:00+05:30",
    body: "Slightly off-topic, but can we also get better lighting near the parking gate? It's quite dark at night.",
    upvotedBy: ["Neha Kulkarni"],
  },
  {
    id: "reply-4-19",
    threadId: "thread-4",
    parentReplyId: "reply-4-18",
    authorName: "Neha Kulkarni",
    authorFlat: flatFor("Neha Kulkarni"),
    postedAt: "2026-06-16T18:35:00+05:30",
    body: "Good point, but let's raise that as a separate thread so it doesn't derail the CCTV vote here.",
    upvotedBy: ["Suresh Iyer", "Vikram Singh Rathore"],
  },
  {
    id: "reply-4-20",
    threadId: "thread-4",
    parentReplyId: "reply-4-19",
    authorName: "Kavya Nair",
    authorFlat: flatFor("Kavya Nair"),
    postedAt: "2026-06-16T18:40:00+05:30",
    body: "Fair, will post a new thread for it.",
    upvotedBy: [],
  },
  {
    id: "reply-4-21",
    threadId: "thread-4",
    authorName: "Rohan Mehta",
    authorFlat: flatFor("Rohan Mehta"),
    postedAt: "2026-06-16T19:00:00+05:30",
    body: "Do we really need this? Feels like unnecessary spending for a couple of minor incidents.",
    upvotedBy: [],
  },
  {
    id: "reply-4-22",
    threadId: "thread-4",
    parentReplyId: "reply-4-21",
    authorName: "Suresh Iyer",
    authorFlat: flatFor("Suresh Iyer"),
    postedAt: "2026-06-16T19:15:00+05:30",
    body: "Given the recent scratch incident and general safety, I think it's justified — and the AMC cost isn't huge if split across flats.",
    upvotedBy: ["Vikram Singh Rathore", "Pooja Banerjee"],
  },
  {
    id: "reply-4-23",
    threadId: "thread-4",
    parentReplyId: "reply-4-22",
    authorName: "Rohan Mehta",
    authorFlat: flatFor("Rohan Mehta"),
    postedAt: "2026-06-16T19:30:00+05:30",
    body: "Fair enough — I'll support it as long as the final cost stays under 40k.",
    upvotedBy: ["Suresh Iyer"],
  },
  // thread-5: 0 replies
  // thread-6: 2 replies
  {
    id: "reply-6-1",
    threadId: "thread-6",
    authorName: "Sunita Patil",
    authorFlat: flatFor("Sunita Patil"),
    postedAt: "2026-06-14T14:20:00+05:30",
    body: "Our cook Leela – 9876543210, excellent Maharashtrian cooking, available mornings.",
    upvotedBy: ["Pooja Banerjee", "Divya Reddy"],
  },
  {
    id: "reply-6-2",
    threadId: "thread-6",
    authorName: "Harish Krishnan",
    authorFlat: flatFor("Harish Krishnan"),
    postedAt: "2026-06-14T16:00:00+05:30",
    body: "Maid: Shanti 9123456789 – reliable for cleaning, C-506 reference.",
    upvotedBy: [],
  },
  // thread-7: 1 reply (locked)
  {
    id: "reply-7-1",
    threadId: "thread-7",
    authorName: "Neha Kulkarni",
    authorFlat: flatFor("Neha Kulkarni"),
    postedAt: "2026-06-13T18:00:00+05:30",
    body: "Thanks for raising, the vendor has been replaced last week. Let's close this.",
    upvotedBy: ["Suresh Iyer"],
  },
  // thread-8: 5 replies
  {
    id: "reply-8-1",
    threadId: "thread-8",
    authorName: "Ananya Gupta",
    authorFlat: flatFor("Ananya Gupta"),
    postedAt: "2026-06-12T12:30:00+05:30",
    body: "I'll bring paneer biryani for 10 people.",
    upvotedBy: ["Divya Reddy"],
  },
  {
    id: "reply-8-2",
    threadId: "thread-8",
    authorName: "Pooja Banerjee",
    authorFlat: flatFor("Pooja Banerjee"),
    postedAt: "2026-06-12T13:15:00+05:30",
    body: "We can bring gulab jamun 20 pcs.",
    upvotedBy: [],
  },
  {
    id: "reply-8-3",
    threadId: "thread-8",
    authorName: "Rohan Mehta",
    authorFlat: flatFor("Rohan Mehta"),
    postedAt: "2026-06-12T14:00:00+05:30",
    body: "Count us for 2 kg veg pulao.",
    upvotedBy: ["Divya Reddy"],
  },
  {
    id: "reply-8-4",
    threadId: "thread-8",
    authorName: "Kavya Nair",
    authorFlat: flatFor("Kavya Nair"),
    postedAt: "2026-06-12T15:30:00+05:30",
    body: "I'll bring paper plates and spoons.",
    upvotedBy: [],
  },
  {
    id: "reply-8-5",
    threadId: "thread-8",
    authorName: "Suresh Iyer",
    authorFlat: flatFor("Suresh Iyer"),
    postedAt: "2026-06-12T16:45:00+05:30",
    body: "We have extra tables if needed.",
    upvotedBy: ["Divya Reddy"],
  },
  // thread-9: 2 replies
  {
    id: "reply-9-1",
    threadId: "thread-9",
    authorName: "Vikram Singh Rathore",
    authorFlat: flatFor("Vikram Singh Rathore"),
    postedAt: "2026-06-11T20:15:00+05:30",
    body: "Noted, will inform the contractor. Sorry for inconvenience.",
    upvotedBy: ["Arvind Deshmukh"],
  },
  {
    id: "reply-9-2",
    threadId: "thread-9",
    authorName: "Rohan Mehta",
    authorFlat: flatFor("Rohan Mehta"),
    postedAt: "2026-06-11T21:00:00+05:30",
    body: "Same issue in A-502 last week, thanks for flagging.",
    upvotedBy: [],
  },
  // thread-10: 0 replies
];

function deriveThread(base: Omit<ForumThread, "replyCount" | "lastActivityAt">): ForumThread {
  const related = forumReplies.filter((r) => r.threadId === base.id);
  const replyCount = related.length;
  const lastActivityAt =
    related.length > 0
      ? related.reduce(
          (max, r) => (new Date(r.postedAt) > new Date(max) ? r.postedAt : max),
          base.postedAt,
        )
      : base.postedAt;
  return { ...base, replyCount, lastActivityAt };
}

export const forumThreads: ForumThread[] = rawThreads.map(deriveThread);

export function getForumThreadById(id: string) {
  return forumThreads.find((t) => t.id === id) ?? null;
}

export function getRepliesForThread(threadId: string) {
  return forumReplies
    .filter((r) => r.threadId === threadId)
    .sort((a, b) => new Date(a.postedAt).getTime() - new Date(b.postedAt).getTime());
}
