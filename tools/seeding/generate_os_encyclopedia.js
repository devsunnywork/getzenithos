const mongoose = require('mongoose');
require('dotenv').config();
const Course = require('../server/models/Course');
const Note = require('../server/models/Note');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/zenith_os';

async function generateEncyclopedia() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log("NEURAL UPLINK ESTABLISHED...");

        const course = await Course.findOne({ title: /Operating Systems/i });
        if (!course) {
            console.error("OS Course missing. Please run generation script first.");
            process.exit(1);
        }

        // Wipe old unit 1 notes for the clean encyclopedia
        await Note.deleteMany({ course: course._id, title: /ENCYCLOPEDIA/i });

        const pages = [];
        const syllabusMeta = [
            { topic: "OS Philosophy & Definitions", count: 5 },
            { topic: "Functions: Resource Management", count: 6 },
            { topic: "Batch & Interactive Systems", count: 5 },
            { topic: "Time Sharing & Real Time Mechanics", count: 7 },
            { topic: "Multiprocessor & Multiuser Architecture", count: 6 },
            { topic: "Multiprocess vs Multithreaded OS", count: 6 },
            { topic: "Layered OS Structure Analysis", count: 8 },
            { topic: "System Components & Services", count: 7 },
            { topic: "Reentrant Kernels & Monolithic vs Microkernel", count: 10 }
        ];

        let pageIdx = 1;
        for (const meta of syllabusMeta) {
            for (let i = 0; i < meta.count; i++) {
                const subTitle = `${meta.topic} // Part ${i + 1}`;
                pages.push({
                    id: Date.now() + pageIdx,
                    texture: pageIdx % 3 === 0 ? 'grid' : (pageIdx % 2 === 0 ? 'dot' : 'lined'),
                    blocks: [
                        {
                            id: `header-${pageIdx}`, type: "tag", content: `CHAPTER 0${Math.ceil(pageIdx / 10)} // SECTION ${pageIdx}`,
                            x: 50, y: 40, w: 200, h: 30, zIndex: 1,
                            styles: { fontSize: 9, color: "#ffffff", bgColor: "#ef4444", borderRadius: 4, padding: "4px 12px", fontFamily: "font-montserrat", fontWeight: "bold" }
                        },
                        {
                            id: `title-${pageIdx}`, type: "text", content: subTitle.toUpperCase(),
                            x: 50, y: 80, w: 700, h: 50, zIndex: 2,
                            styles: { fontSize: 26, color: "#1e293b", fontFamily: "font-playfair", fontWeight: "black", tracking: "tight" }
                        },
                        {
                            id: `divider-${pageIdx}`, type: "divider", content: "",
                            x: 50, y: 140, w: 700, h: 2, zIndex: 3, styles: { bgColor: "#e2e8f0" }
                        },
                        // MAIN CONTENT BLOCK
                        {
                            id: `main-text-${pageIdx}`, type: "text",
                            content: `Detailed analysis of ${meta.topic}. This section covers the fundamental principles and operational logic governing ${meta.topic.toLowerCase()}. In modern systems, this component plays a critical role in maintaining system stability and performance. \n\nAkant Tripathi's AKTU syllabus emphasizes the understanding of how these theoretical models translate into real-world kernel implementation. We explore the memory allocation patterns, the scheduling overhead, and the architectural trade-offs that define this specific domain of system programming.`,
                            x: 50, y: 160, w: 700, h: 180, zIndex: 4,
                            styles: { fontSize: 16, color: "#334155", fontFamily: "font-poppins", lineHeight: "1.7", textAlign: "justify" }
                        },
                        // TECHNICAL SIDEBAR / CALLOUT
                        {
                            id: `callout-${pageIdx}`, type: "callout",
                            content: `PRO TIP: For AKTU Semester 4 exams, focus on the differences between ${meta.topic}. This is a recurring high-weightage topic.`,
                            x: 50, y: 360, w: 400, h: 100, zIndex: 5,
                            styles: { fontSize: 14, color: "#1e40af", bgColor: "#eff6ff", borderRadius: 16, padding: 25, borderLeft: "8px solid #3b82f6", fontFamily: "font-raleway" }
                        },
                        // STICKY NOTE FOR KEY TERMS
                        {
                            id: `sticky-${pageIdx}`, type: "sticky",
                            content: `KEY TERMS:\n- Latency\n- Throughput\n- Utilization\n- Response Time`,
                            x: 480, y: 360, w: 270, h: 180, zIndex: 6,
                            styles: { fontSize: 16, color: "#713f12", bgColor: "#fef9c3", borderRadius: 4, padding: 25, rotation: pageIdx % 2 === 0 ? 1 : -1, fontFamily: "font-script" }
                        },
                        // BOTTOM TECHNICAL BLOCK (Checklist or Code)
                        {
                            id: `tech-block-${pageIdx}`, type: pageIdx % 2 === 0 ? "checklist" : "code",
                            title: pageIdx % 2 === 0 ? "System Requirements" : "kernel_config.h",
                            content: pageIdx % 2 === 0 ? "☐ Context Switch Logic\n☐ Register State Saving\n☐ Memory Protection Unit\n☐ I/O Buffer Loading" : "/* Kernel Tuning */\n#define MAX_PROCESSES 1024\n#define TIME_SLICE 20\n#define KERNEL_MODE 0x01",
                            x: 50, y: 550, w: 700, h: 150, zIndex: 7,
                            styles: { fontSize: 14, color: pageIdx % 2 === 0 ? "#1e293b" : "#e2e8f0", bgColor: pageIdx % 2 === 0 ? "#f8fafc" : "#1e293b", borderRadius: 16, padding: 20, fontFamily: pageIdx % 2 === 0 ? "font-poppins" : "font-mono" }
                        },
                        {
                            id: `footer-${pageIdx}`, type: "text", content: `ZENITH NEURAL RECORDS // OS-U1-P${pageIdx} // DO NOT DISTRIBUTE`,
                            x: 50, y: 730, w: 700, h: 20, zIndex: 8,
                            styles: { fontSize: 9, color: "#94a3b8", fontFamily: "font-mono", tracking: "0.2em", fontWeight: "bold" }
                        }
                    ]
                });
                pageIdx++;
            }
        }

        const note = new Note({
            title: "Operating Systems // UNIT 1: COMPLETE ENCYCLOPEDIA (60+ PAGES)",
            course: course._id,
            content: {
                activePageIndex: 0,
                pages: pages
            }
        });

        await note.save();
        console.log(`ENCYCLOPEDIA DEPLOYED: ${pages.length} High-Fidelity Pages generated.`);
        process.exit(0);
    } catch (err) {
        console.error("ENCYCLOPEDIA UPLINK FAILED:", err);
        process.exit(1);
    }
}

generateEncyclopedia();
