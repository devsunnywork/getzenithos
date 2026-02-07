const mongoose = require('mongoose');
require('dotenv').config();
const Course = require('../server/models/Course');
const Note = require('../server/models/Note');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/zenith_os';

async function generateOSNotes() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log("Connected to Neural Database...");

        // 1. Find or Create OS Course
        let course = await Course.findOne({ title: /Operating System/i });
        if (!course) {
            course = new Course({
                title: "Operating Systems (CS301)",
                description: "Deep dive into OS kernel, resource management, and systems architecture.",
                instructor: "Aditya Zenith",
                thumbnail: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=1000",
                price: 0,
                isPublished: true
            });
            await course.save();
            console.log("Course 'Operating Systems' generated.");
        }

        // 2. Clear existing notes for this course to avoid duplicates (optional, but cleaner)
        await Note.deleteMany({ course: course._id, title: /Unit 1/i });

        // 3. Construct the "Notes Studio" JSON Content
        const osContent = {
            activePageIndex: 0,
            pages: [
                // PAGE 1: INTRODUCTION & SERVICES
                {
                    id: Date.now() + 1,
                    texture: 'lined',
                    blocks: [
                        {
                            id: "title-1", type: "text", content: "UNIT 1: INTRODUCTION & SERVICES",
                            x: 50, y: 50, w: 700, h: 60, zIndex: 1,
                            styles: { fontSize: 32, color: "#1e293b", fontFamily: "font-playfair", fontWeight: "bold" }
                        },
                        {
                            id: "intro-1", type: "callout", content: "An Operating System (OS) is a program that acts as an intermediary between a user of a computer and the computer hardware.",
                            x: 50, y: 130, w: 700, h: 80, zIndex: 2,
                            styles: { fontSize: 16, color: "#1e40af", bgColor: "#eff6ff", borderRadius: 12, padding: 20, borderLeft: "6px solid #3b82f6", fontFamily: "font-poppins" }
                        },
                        {
                            id: "func-title", type: "text", content: "Functions of OS",
                            x: 50, y: 240, w: 300, h: 40, zIndex: 3,
                            styles: { fontSize: 20, color: "#1e293b", fontFamily: "font-ubuntu", textDecoration: "underline" }
                        },
                        {
                            id: "func-list", type: "checklist", content: "☐ Process Management\n☐ Memory Management\n☐ File Management\n☐ I/O System Management\n☐ Secondary Storage Management\n☐ Networking & Security",
                            x: 50, y: 290, w: 350, h: 200, zIndex: 4,
                            styles: { fontSize: 16, color: "#1e293b", bgColor: "#ffffff", borderRadius: 8, padding: 15, fontFamily: "font-raleway" }
                        },
                        {
                            id: "goals-sticky", type: "sticky", content: "GOALS:\n1. Convenience\n2. Efficiency\n3. Scalability",
                            x: 450, y: 240, w: 300, h: 150, zIndex: 5,
                            styles: { fontSize: 18, color: "#713f12", bgColor: "#fef9c3", borderRadius: 4, padding: 25, rotation: 2, fontFamily: "font-script" }
                        },
                        {
                            id: "resource-manager", type: "text", content: "OS as Resource Manager: It allocates hardware resources (CPU time, memory space, file storage) to specific programs and users.",
                            x: 50, y: 510, w: 700, h: 60, zIndex: 6,
                            styles: { fontSize: 15, color: "#475569", fontFamily: "font-lora", fontStyle: "italic" }
                        }
                    ]
                },
                // PAGE 2: OS SERVICES & STRUCTURE
                {
                    id: Date.now() + 2,
                    texture: 'dot',
                    blocks: [
                        {
                            id: "services-title", type: "text", content: "OPERATING SYSTEM SERVICES",
                            x: 50, y: 50, w: 700, h: 50, zIndex: 1,
                            styles: { fontSize: 28, color: "#ef4444", fontFamily: "font-oswald" }
                        },
                        {
                            id: "services-grid", type: "text", content: "• Program Execution: System must be able to load a program into memory and run it.\n• I/O Operations: A running program may require I/O (files, devices).\n• File-System Manipulation: Reading/writing files and directories.\n• Communications: Processes exchange information.\n• Error Detection: Constantly checking for hardware or user errors.",
                            x: 50, y: 120, w: 700, h: 200, zIndex: 2,
                            styles: { fontSize: 16, color: "#334155", fontFamily: "font-poppins", lineHeight: "1.8" }
                        },
                        {
                            id: "struct-title", type: "text", content: "OS STRUCTURES",
                            x: 50, y: 350, w: 700, h: 40, zIndex: 3,
                            styles: { fontSize: 22, color: "#1e293b", fontFamily: "font-ubuntu" }
                        },
                        {
                            id: "struct-monolithic", type: "callout", content: "Monolithic: Entire OS runs as a single program in kernel mode. Efficient but unstable.",
                            x: 50, y: 400, w: 340, h: 100, zIndex: 4,
                            styles: { fontSize: 14, color: "#166534", bgColor: "#f0fdf4", borderRadius: 12, padding: 15, borderLeft: "6px solid #22c55e", fontFamily: "font-raleway" }
                        },
                        {
                            id: "struct-microkernel", type: "callout", content: "Microkernel: Minimal kernel features; most services moved to user space. Modular and secure.",
                            x: 410, y: 400, w: 340, h: 100, zIndex: 5,
                            styles: { fontSize: 14, color: "#92400e", bgColor: "#fffbeb", borderRadius: 12, padding: 15, borderLeft: "6px solid #f59e0b", fontFamily: "font-raleway" }
                        },
                        {
                            id: "layered", type: "thought", content: "Layered Approach: OS divided into layers (0 to N). Layer 0 is hardware, Layer N is UI.",
                            x: 50, y: 520, w: 700, h: 80, zIndex: 6,
                            styles: { fontSize: 15, color: "#1e293b", bgColor: "#ffffff", borderRadius: 50, padding: 25, fontFamily: "font-poppins", border: "1px dashed #cbd5e1" }
                        }
                    ]
                },
                // PAGE 3: TYPES OF OS & VIRTUAL MACHINES
                {
                    id: Date.now() + 3,
                    texture: 'grid',
                    blocks: [
                        {
                            id: "types-title", type: "text", content: "TYPES OF OPERATING SYSTEMS",
                            x: 50, y: 50, w: 700, h: 50, zIndex: 1,
                            styles: { fontSize: 26, color: "#1e293b", fontFamily: "font-poppins", fontWeight: "bold" }
                        },
                        {
                            id: "batch-os", type: "tag", content: "BATCH OS", x: 50, y: 110, w: 100, h: 30, zIndex: 2,
                            styles: { fontSize: 10, color: "#ffffff", bgColor: "#64748b", borderRadius: 20, padding: "4px 12px", fontFamily: "font-montserrat" }
                        },
                        {
                            id: "batch-desc", type: "text", content: "Used in the 60s. Users did not interact; jobs were processed in batches.",
                            x: 160, y: 115, w: 590, h: 30, zIndex: 3, styles: { fontSize: 13, color: "#64748b" }
                        },
                        {
                            id: "rtos", type: "tag", content: "REAL-TIME OS (RTOS)", x: 50, y: 160, w: 160, h: 30, zIndex: 4,
                            styles: { fontSize: 10, color: "#ffffff", bgColor: "#ef4444", borderRadius: 20, padding: "4px 12px", fontFamily: "font-montserrat" }
                        },
                        {
                            id: "rtos-desc", type: "text", content: "Time-bound systems. Hard (strict deadlines) vs Soft (preferred deadlines).",
                            x: 220, y: 165, w: 530, h: 30, zIndex: 5, styles: { fontSize: 13, color: "#64748b" }
                        },
                        {
                            id: "vm-title", type: "text", content: "Virtual Machines (VM)",
                            x: 50, y: 250, w: 700, h: 40, zIndex: 6,
                            styles: { fontSize: 22, color: "#1e293b", fontFamily: "font-ubuntu" }
                        },
                        {
                            id: "vmm", type: "quote", content: "Virtual Machine Monitor (VMM) or Hypervisor: The software layer that creates and runs virtual machines by abstracting hardware.",
                            x: 50, y: 300, w: 700, h: 100, zIndex: 7,
                            styles: { fontSize: 18, color: "#475569", fontFamily: "font-playfair", borderLeft: "4px solid #3b82f6", padding: 20 }
                        },
                        {
                            id: "vm-code", type: "code", title: "hypervisor.cfg", content: "[VM_CONFIG]\nCPU=4\nRAM=8GB\nSTORAGE=VirtIO\nNETWORK=Bridged",
                            x: 50, y: 420, w: 700, h: 140, zIndex: 8,
                            styles: { fontSize: 14, color: "#e2e8f0", bgColor: "#0f172a", borderRadius: 12, padding: 0, fontFamily: "font-mono" }
                        }
                    ]
                },
                // PAGE 4: KERNEL & MODES
                {
                    id: Date.now() + 4,
                    texture: 'plain',
                    blocks: [
                        {
                            id: "kernel-title", type: "text", content: "KERNEL & MODES OF OPERATION",
                            x: 50, y: 50, w: 700, h: 50, zIndex: 1,
                            styles: { fontSize: 28, color: "#1e293b", fontFamily: "font-playfair" }
                        },
                        {
                            id: "kernel-def", type: "text", content: "The kernel is the core of the OS. It remains in memory throughout the computer's operation.",
                            x: 50, y: 120, w: 700, h: 40, zIndex: 2,
                            styles: { fontSize: 16, color: "#334155", fontFamily: "font-poppins" }
                        },
                        {
                            id: "modes-grid", type: "text", content: "USER MODE\n• Restricted Access\n• Apps Run Here\n• Bit = 1",
                            x: 100, y: 200, w: 250, h: 120, zIndex: 3,
                            styles: { fontSize: 14, color: "#1e3a8a", bgColor: "#dbeafe", borderRadius: 12, padding: 20, fontFamily: "font-mono", textAlign: "center" }
                        },
                        {
                            id: "modes-kernel", type: "text", content: "KERNEL MODE\n• Privileged Access\n• OS Core Runs Here\n• Bit = 0",
                            x: 450, y: 200, w: 250, h: 120, zIndex: 4,
                            styles: { fontSize: 14, color: "#ffffff", bgColor: "#1e293b", borderRadius: 12, padding: 20, fontFamily: "font-mono", textAlign: "center" }
                        },
                        {
                            id: "mode-switch", type: "divider", content: "", x: 100, y: 350, w: 600, h: 4, zIndex: 5, styles: { bgColor: "#e2e8f0" }
                        },
                        {
                            id: "syscall", type: "callout", content: "A 'System Call' is the mechanism used by an application program to request a service from the operating system.",
                            x: 50, y: 400, w: 700, h: 80, zIndex: 6,
                            styles: { fontSize: 16, color: "#1e293b", bgColor: "#f8fafc", borderRadius: 12, padding: 15, borderLeft: "6px solid #64748b", fontFamily: "font-raleway" }
                        },
                        {
                            id: "final-note", type: "sticky", content: "SUMMARY:\nOS is the heart of the system, managing resources and providing services through System Calls.",
                            x: 250, y: 520, w: 300, h: 120, zIndex: 7,
                            styles: { fontSize: 15, color: "#064e3b", bgColor: "#dcfce7", borderRadius: 4, padding: 20, rotation: -2, fontFamily: "font-script" }
                        }
                    ]
                }
            ]
        };

        const note = new Note({
            title: "Operating Systems // UNIT 1: FOUNDATIONS",
            course: course._id,
            content: osContent
        });

        await note.save();
        console.log("NEURAL RECORD DEPLOYED: OS UNIT 1.");

        process.exit(0);
    } catch (err) {
        console.error("DATA UPLINK FAILURE:", err);
        process.exit(1);
    }
}

generateOSNotes();
