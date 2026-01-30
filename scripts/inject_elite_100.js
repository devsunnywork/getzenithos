
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const Skill = require('../server/models/Skill');

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected');
    } catch (err) {
        console.error("DB Error:", err.message);
        process.exit(1);
    }
};

const syllabus = [
    // Phase 1 (001-032)
    "001: Primitives & Bit-Depth", "002: Stack vs Heap", "003: The Variable Matrix", "004: String Interning", "005: Arithmetic Protocols", "006: Boolean Logic Circuits", "007: Bitwise Operations", "008: Implicit vs Explicit Casting",
    "009: Switch vs If Optimization", "010: The Guard Clause Pattern", "011: Ternary Logic", "012: While & Do-While Circuits", "013: For-Loop Contiguity", "014: Foreach Allocation Pitfalls", "015: Control Flow Protocols", "016: O(n^2) Logic Hazards",
    "017: Array Architecture", "018: Multidimensional vs Jagged", "019: List Dynamic Resizing", "020: Dictionary Hash-Maps", "021: HashSet Unique Ops", "022: Stack & Queue Systems", "023: Sorting Algorithms", "024: LINQ Architecture",
    "025: Method Signatures", "026: Parameter Modifiers", "027: Named & Optional Args", "028: Method Overloading", "029: Generic Programming", "030: Scope Protocols", "031: Static Class Persistence", "032: Recursion & Stack Depth",

    // Phase 2 (033-060)
    "033: Hierarchy Architecture", "034: The Transform Matrix", "035: Quaternions vs Euler", "036: Tagging & Layering", "037: Component Pattern", "038: Awake/Start/Update", "039: FixedUpdate Physics", "040: LateUpdate Interpolation",
    "041: MonoBehaviour Profiling", "042: Prefab Variants", "043: Asset Metadata", "044: Physics Raycasting", "045: RigidBody Dynamics", "046: Collision Triggers", "047: Friction & Bounciness", "048: Force & Torque Ops",
    "049: Splines & Path Tracking", "050: Camera Frustum", "051: Layer Masking", "052: Scene Management", "053: Batching Strategies", "054: New Input System", "055: UI Toolkit", "056: Canvas Scaling",
    "057: Sprite Atlas Packing", "058: Audio Mixer Hub", "059: Particle System Burst", "060: Video Streaming",

    // Phase 3 (061-085)
    "061: ScriptableObject Containers", "062: Event-Driven Design", "063: Singleton implementation", "064: Finite State Machines", "065: Behavior Trees", "066: NavMesh Surfaces", "067: AI Path Jump/Climb", "068: AI Perception (LOS)",
    "069: Unity Profiler Deep-Dive", "070: Memory Heap Analysis", "071: GC Allocation Spikes", "072: Object Pooling System", "073: Async/Await logic", "074: Task-Based Programming", "075: JSON Persistence", "076: Save Encryption",
    "077: Addressable Assets", "078: Shader Graph Mastery", "079: Post-Processing Fx", "080: URP Configuration", "081: Lighting (Baked/Real)", "082: Reflection Probes", "083: Occlusion Culling", "084: Job System (ECS)",
    "085: Native C++ Bridges",

    // Phase 4 (086-100)
    "086: Multiplayer Netcode", "087: VR/AR Interaction", "088: Global Localization", "089: Git/Version Control", "090: Platform Deployment", "091: Project Alpha: Shooter", "092: Project Beta: RPG", "093: Project Gamma: RTS",
    "094: CI/CD Game Cloud", "095: Analytics Insight", "096: Portfolio Showcase", "097: Publishing Hubs", "098: Interview Protocol", "099: Resume Enhancement", "100: Final Graduation"
];

const injectElite100 = async () => {
    await connectDB();

    const skill = await Skill.findOne({ name: /Unity/i });
    if (!skill) {
        console.error("Skill not found!");
        process.exit(1);
    }

    console.log(`Expanding ${skill.name} to 100 nodes...`);

    const newTopics = syllabus.map((item, index) => {
        const xPos = 400 + (index % 2 === 0 ? 80 : -80);
        const yPos = 150 + (index * 150);

        // Generate High-Density Content Template
        const content = `**Definition**: ${item} is a critical component of professional game development. It allows developers to ${index < 32 ? 'manage memory and logic with binary precision' : (index < 60 ? 'interface with the Unity engine cycle' : 'architect complex scalable systems')}.

**Briefing**: This module focuses on the deep-level implementation details of ${item.split(':')[1]}. In professional studio environments, mastering this topic ensures high-performance code and prevents common memory bottlenecks. We will explore the internal architecture and how the CPU/GPU handles these operations.

**Key Points**:
- **Protocol Alpha**: Core architectural integration and initialization logic.
- **Protocol Beta**: Performance optimization and memory footprint management.
- **Strategic Implementation**: Standard design patterns used in AAA production.
- **Verification**: Profiler validation and heat-map analysis.

**Code Example**:
\`\`\`csharp
public class EliteModule : MonoBehaviour {
    // Neural Link Data
    [SerializeField] private float protocolBit = 1.0f;
    
    // Core Operation
    public void Initialize() {
        Debug.Log("Executing Protocol: ${item}");
    }
}
\`\`\`

**Usage**:
Typically implemented during the ${index < 40 ? 'Engine Initialization' : 'Gameplay Loop'} phase to ensure system stability.

**Pro-Tips**:
- Always profile the memory allocation before and after implementation.
- Use explicit types to ensure bit-depth consistency in networked environments.

**Pitfalls**:
- Avoid heavy computation within the primary update cycle if possible.
- Watch for GC spikes during high-density object instantiation.
`;

        return {
            _id: new mongoose.Types.ObjectId(),
            title: item,
            description: `Deep-dive study into ${item}. Full protocol synchronization required.`,
            content: content,
            xp: 150,
            type: 'main',
            position: { x: xPos, y: yPos },
            parents: index > 0 ? [syllabus[index - 1]] : []
        };
    });

    skill.topics = newTopics;
    skill.updatedAt = Date.now();

    await skill.save();
    console.log(`🚀 MISSION COMPLETE: 100 Nodes Injected into ${skill.name}.`);
    process.exit();
};

injectElite100();
