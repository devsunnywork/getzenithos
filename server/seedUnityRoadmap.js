const mongoose = require('mongoose');
const Skill = require('./models/Skill');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/zenith_os';

async function seedSingleSkillModularUnity() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log("Connected to Zenith Primary Uplink.");

        // 1. Purge the 7 sectional skills and the previous single skill
        const sectionNames = [
            "Unity Part 1: C# Neural Foundations",
            "Unity Part 2: Advanced OOP & Memory",
            "Unity Part 3: Unity Engine Core",
            "Unity Part 4: Physics & Interaction",
            "Unity Part 5: UI, Audio & VFX",
            "Unity Part 6: Pro Architecture",
            "Unity Part 7: Optimization & Pro",
            "Unity C# Masterclass (2025)"
        ];
        await Skill.deleteMany({ name: { $in: sectionNames } });
        console.log("Purged legacy modular/single skills.");

        const skillName = "Unity C# Masterclass (2025)";

        const phases = [
            { id: "Root1", name: "PHASE 1: C# NEURAL FOUNDATIONS", range: [1, 60], color: "#ef4444" },
            { id: "Root2", name: "PHASE 2: ADVANCED OOP & MEMORY", range: [61, 120], color: "#3b82f6" },
            { id: "Root3", name: "PHASE 3: UNITY ENGINE MASTERY", range: [121, 180], color: "#22c55e" },
            { id: "Root4", name: "PHASE 4: PHYSICS & GAMEPLAY", range: [181, 240], color: "#a855f7" },
            { id: "Root5", name: "PHASE 5: UI, AUDIO & VFX GRAPH", range: [241, 300], color: "#eab308" },
            { id: "Root6", name: "PHASE 6: PRO ARCHITECTURE & DOTS", range: [301, 360], color: "#14b8a6" },
            { id: "Root7", name: "PHASE 7: OPTIMIZATION & DEPLOY", range: [361, 412], color: "#f97316" }
        ];

        const allTitles = [
            // (All 412 titles are included internally)
            "001: Variables & Value Types", "002: Char & Bool", "003: String Immutability", "004: Const & Readonly", "005: Variable Scope", "006: Implicit/Explicit Casting", "007: Parse & TryParse", "008: Arithmetic Ops", "009: Modulo %", "010: Inc/Dec ++ --", "011: Comparison Ops", "012: Logical Ops", "013: Bitwise XOR basics", "014: Ternary Op", "015: Null Coalescing", "016: Null-Conditional", "017: If/Else Flow", "018: Switch States (Classic)", "019: Switch Expressions", "020: For Loops", "021: While Loops", "022: Do-While Loops", "023: Foreach Loops", "024: Break/Continue", "025: Nested Loops", "026: Single-Dim Arrays", "027: Multi-Dim Arrays", "028: Jagged Arrays", "029: Array Methods", "030: List<T> Foundations", "031: List Add/Remove", "032: List Search", "033: Capacity vs Count", "034: Stack vs Heap", "035: String Concat/Interp", "036: Substring/IndexOf", "037: Split, Join, Trim", "038: Replace & Casing", "039: StringBuilder Perf", "040: Enum Definition", "041: Enum Casting", "042: Flags Attribute", "043: Method Signatures", "044: Ref, Out, In Params", "045: Optional Params", "046: Method Overloading", "047: Recursion Basics", "048: Try-Catch Errors", "049: Finally & Cleanup", "050: Throwing Exceptions", "051: Custom Exceptions", "052: Nameof Operator", "053: MathF Class", "054: Random Gen", "055: Bitwise AND, OR", "056: Bit Shifting", "057: Structs Definition", "058: Structs vs Classes", "059: DateTime C#", "060: Game Logic Intro",
            "061: Class vs Object", "062: Encapsulation Props", "063: Access Modifiers", "064: Internal Access", "065: Constructors Core", "066: Constructor Chaining", "067: Static Members", "068: Static Utility", "069: Static Constructors", "070: Inheritance Logic", "071: Override vs Virtual", "072: Sealed Modifiers", "073: Abstract Base", "074: Abstract Methods", "075: Interfaces Contracts", "076: Multiple Interfaces", "077: Interface vs Abstract", "078: Explicit Impl", "079: Dynamic Polymorphism", "080: Composition Logic", "081: Generic Classes", "082: Generic Methods", "083: Type Constraints", "084: Dictionary Collections", "085: HashSet Uniqueness", "086: Queue T (FIFO)", "087: Stack T (LIFO)", "088: Sorted Collections", "089: IEnumerable Pattern", "090: Yield Return", "091: Single Delegates", "092: Multi-cast Delegates", "093: Anonymous Methods", "094: Lambda Expressions", "095: Action T Generic", "096: Func T Generic", "097: Predicate T", "098: Event Pattern", "099: Event Handlers", "100: Garbage Collection", "101: LINQ Where", "102: LINQ Select", "103: LINQ Group/Join", "104: LINQ First/Last", "105: LINQ Math Helpers", "106: Extension Methods", "107: Partial Classes", "108: [Obsolete] Attributes", "109: [SerializeField] Intro", "110: Reflection API", "111: Inspecting Methods", "112: Dynamic Keyword", "113: File Text I/O", "114: Binary Serial", "115: JsonUtility", "116: Threading Basics", "117: Task Pattern", "118: Async Exception", "119: IDisposable Pattern", "120: SOLID Principles",
            "121: Unity Hub & Versions", "122: Project Templates", "123: Scene & Game Views", "124: Inspector & Hierarchy", "125: Project & Console", "126: Coords: World/Local", "127: Transform Translation", "128: Euler Rotations", "129: Scaling Components", "130: Hierarchy Parenting", "131: GameObject States", "132: Managing Components", "133: Prefab Foundations", "134: Prefab Overrides", "135: Prefab Variants", "136: Nested Prefabs", "137: Prefab Modes", "138: MonoBehaviour Base", "139: Awake/Start/Update", "140: Fixed/LateUpdate", "141: Inspector Vars", "142: Public vs Serialized", "143: Editor UI Attributes", "144: Range & Tooltips", "145: Asset Importers", "146: Meta Files Logic", "147: Folder Structure", "148: Camera FoV", "149: Ortho vs Persp", "150: Culling Masks", "151: Basic Lighting", "152: Realtime/Baked", "153: Standard Shaders", "154: Texture Albedo", "155: PBR Smoothness", "156: Skybox Logic", "157: Render Components", "158: Scene Logic Bundle", "159: Async Scene Load", "160: Searchable Tags", "161: Multi-Physics Layers", "162: Gizmo Debugging", "163: Legacy Input", "164: Axis & Buttons", "165: Time.deltaTime", "166: FixedDeltaTime", "167: Enable/Disable Sync", "168: Destruction Logic", "169: 2D Sprite Render", "170: Sorting Orders", "171: PPU Calculations", "172: Sprite Pivots", "173: Audio Sources", "174: 2D vs 3D Sound", "175: Audio Looping", "176: Rigidbody Setup", "177: Kinematic Motion", "178: Pred/Interp", "179: Primitive Colliders", "180: Mesh Collider Caveats",
            "181: Trigger Logic", "182: Collision Logic", "183: Collision Matrix", "184: Physic Materials", "185: Const Force", "186: Raycasting Base", "187: RaycastHit Info", "188: LayerMasks", "189: Debug DrawRay", "190: Cast Types (Sphere)", "191: Overlap Detectors", "192: 2D Effectors", "193: Buoyancy Mechanics", "194: Controller vs RB", "195: New Input Package", "196: Action Maps", "197: Bindings Systems", "198: Logic Callbacks", "199: Platform Mechanics", "200: Player Move Core", "201: Ground Detect", "202: Health Systems", "203: Inventory Structs", "204: Powerup Logic", "205: Spawning Engine", "206: Waypoint AI", "207: Shooting Logic", "208: Timer Logic", "209: Save Systems", "210: Day/Night Engine", "211: GetComponent Perf", "212: TryGet Perf", "213: Find Tag (Avoid)", "214: SendMessage Deprec", "215: SO Data Strategy", "216: Global Settings", "217: Item DB Strategy", "218: Unity Singleton", "219: Static Persistence", "220: Coroutine Yield", "221: Time Wait Logic", "222: Wait Until Logic", "223: Stopping Corout", "224: Vector Direction", "225: Magnitude Logic", "226: Dot Prod Detect", "227: Cross Prod Rotate", "228: Lerp/Slerp Math", "229: SmoothDamp Cam", "230: Quat Foundations", "231: Slerp LookRotate", "232: Dist Calculations", "233: Animator States", "234: Trans/Exit Time", "235: Anim Params", "236: Move Blend Trees", "237: Anim Callbacks", "238: Layer Masking", "239: Inverse Kinem", "240: Procedural Anim",
            "241: Canvas Scaler", "242: Anchoring Tech", "243: TMP Essentials", "244: UI Button Relay", "245: Health Bar Slid", "246: Sprite UI Logic", "247: Layout Groups", "248: Scroll Views", "249: UI Raycasting", "250: World Canvas", "251: Modal UI Logic", "252: UI Transitions", "253: Screen Faders", "254: UXML Foundations", "255: USS Foundations", "256: Audio Mixers", "257: Vol Ducking", "258: Reverb Zones", "259: Vol Scripting", "260: Random Pitch", "261: Shuriken VFX", "262: Emission Tech", "263: Color Lifecycle", "264: Sub-emitters", "265: Trail Render", "266: VFX Graph Core", "267: VFX Fires", "268: GPU Buffers", "269: Shader Tiling", "270: Glowing Shaders", "271: Dissolve FX", "272: Water Shaders", "273: BiRP vs URP", "274: URP Settings", "275: PP Volumes", "276: Bloom/Color", "277: Vignette FX", "278: Focus (DoF)", "279: Blur Logic", "280: URP Decals", "281: Mobile Probes", "282: Reflect Probes", "283: Baked GI", "284: Lightmapping", "285: LOD Systems", "286: Occlusion Setup", "287: Static Batching", "288: Dynamic Limits", "289: GPU Instancing", "290: Frustum Culling", "291: NavMesh Space", "292: Agent Logic", "293: Off-Mesh Links", "294: Obstacle Logic", "295: AI Steering", "296: Distance Behavior", "297: Sensory Line", "298: FSM Enemies", "299: Behavior Trees", "300: Crowd Basics",
            "301: SOLID: SRP", "302: SOLID: Open/Close", "303: SOLID: Liskov", "304: SOLID: Interface", "305: SOLID: Depend Invert", "306: SO Event Arch", "307: Observer Actions", "308: Undo Command", "309: Injection Factory", "310: Pooling Project", "311: Char States", "312: Ability Strategy", "313: Buff Decorator", "314: Service Locator", "315: Asmdef Arch", "316: Namespace Logic", "317: Decoupled UI", "318: Data-Driven", "319: Boxing Avoidance", "320: Struct Heavy Data", "321: CPU Profiling", "322: Memory Analysis", "323: Debug Frame", "324: Update Opti", "325: Pool Opti", "326: String Opti", "327: Native Jobs", "328: ECS (Intro)", "329: Multi-core Job", "330: Burst Compiler", "331: Addressable Sys", "332: Remote Load", "333: Spawn Memory", "334: Adv Reflection", "335: Custom Attribs", "336: Inspector GUI", "337: Editor Windows", "338: Gizmo Scripts", "339: Asset Postpro", "340: SO Custom Ed", "341: Odin Inspector", "342: DoTween Basis", "343: TMP Styles", "344: CI/CD Jenkins", "345: Pipeline Script", "346: EditMode Test", "347: PlayMode Test", "348: Mocking Deps", "349: Git LFS", "350: Conflict Strat", "351: Git Ignoring", "352: Netcode NGO", "353: NetManager", "354: Net Spawning", "355: NGO RPCs", "356: NetworkVars", "357: NGO Sync", "358: NGO Predict", "359: NGO Author", "360: Lobby Engine",
            "361: Draw Reduction", "362: Atlas Packing", "363: Mat Instancing", "364: Mesh Compress", "365: Audio Opti", "366: Mobile Shaders", "367: Loop Best Prac", "368: GC Cleaning", "369: Overdraw Opti", "370: Manual Cull", "371: Cam Shake Polish", "372: Screen Flash", "373: Juice Theory", "374: Impact VFX", "375: Dyn Sound SFX", "376: Haptics Tech", "377: Rebindable UX", "378: PC Builds", "379: Android Builds", "380: iOS Builds", "381: WebGL Builds", "382: Aspect Scales", "383: Store Rules", "384: Steamworks SDK", "385: Play Console", "386: Unity Ads", "387: In-App Purc", "388: Analytics Sys", "389: Agile Scrum", "390: GDD Strategy", "391: Portfolio Dev", "392: Interview Prep", "393: Proto 1: 2D", "394: Proto 2: 3D", "395: Proto 3: Phys", "396: Proto 4: NGO", "397: VR Foundations", "398: AR Foundations", "399: Procedural Gen", "400: Compute Shader", "401: Script Templates", "402: Source Navig", "403: Console Opti", "404: HDRP Basics", "405: Vol Fog FX", "406: Ray-Traced Ref", "407: ML-Agents AI", "408: Custom URP", "409: Script Build", "410: Native Plugins", "411: Master Arch", "412: Roadmap Complete"
        ];

        const topics = [];
        let currentY = 100;
        let lastPhaseRootTitle = null;

        phases.forEach((p, pIdx) => {
            // 1. PHASE ROOT NODE
            const phaseRootTitle = p.name;
            const phaseRootPos = { x: 500, y: currentY };

            topics.push({
                title: phaseRootTitle,
                type: 'group',
                position: phaseRootPos,
                xp: 1000,
                content: `# ${phaseRootTitle}\nStarting point for this module group.`,
                parents: lastPhaseRootTitle ? [lastPhaseRootTitle] : [] // Connect Root to Root!
            });

            // 2. PHASE SUB-TOPICS (Dense Arrangement)
            const phaseTopics = allTitles.slice(p.range[0] - 1, p.range[1]);
            let topicY = currentY + 400;
            let leftColY = topicY, rightColY = topicY, mainColY = topicY;

            phaseTopics.forEach((tTitle, tIdx) => {
                let type = 'main';
                let pos = { x: 500, y: mainColY };
                let parents = [];

                if (tIdx === 0) {
                    parents = [phaseRootTitle]; // Connect first node to its Root
                } else {
                    parents = [phaseTopics[tIdx - 1]]; // Usual sequence
                }

                // Alternate branching to save vertical space
                if (tIdx % 3 === 1) {
                    type = 'branch';
                    pos = { x: 250, y: leftColY };
                    leftColY += 250;
                } else if (tIdx % 3 === 2) {
                    type = 'branch';
                    pos = { x: 750, y: rightColY };
                    rightColY += 250;
                } else {
                    mainColY += 300;
                }

                topics.push({
                    title: tTitle,
                    type: type,
                    position: pos,
                    parents: parents,
                    xp: 100,
                    content: `### Objective\nMaster **${tTitle}**.`,
                    lectures: [{ title: "Tutorial Vector", videoUrl: "https://youtube.com/results?search_query=Unity+" + tTitle.replace(/[: ]/g, '+') }]
                });
            });

            lastPhaseRootTitle = phaseRootTitle;
            currentY = Math.max(leftColY, rightColY, mainColY) + 600; // Next root far enough below
        });

        // Upsert to a SINGLE Skill
        const result = await Skill.findOneAndUpdate(
            { name: skillName },
            {
                name: skillName,
                category: "Game Dev",
                description: "A monumental 412-topic curriculum organized into 7 clearly linked 'Roots'. Focus on one root at a time to master the entire engine.",
                topics: topics,
                xpRequired: 41200,
                icon: "fa-gamepad",
                color: "#ff0000"
            },
            { upsert: true, new: true }
        );

        console.log(`SUCCESS: [${skillName}] consolidated with ${result.topics.length} nodes across 7 linked Roots.`);
        process.exit(0);
    } catch (err) {
        console.error("UPLINK FAILURE:", err);
        process.exit(1);
    }
}

seedSingleSkillModularUnity();
