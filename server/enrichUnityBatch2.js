const mongoose = require('mongoose');
const Skill = require('./models/Skill');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/zenith_os';

async function enrichBatch() {
    try {
        await mongoose.connect(MONGO_URI);
        const skill = await Skill.findOne({ name: "Unity C# Masterclass (2025)" });

        if (!skill) {
            console.error("Skill not found!");
            process.exit(1);
        }

        const data = [
            {
                title: "006: Implicit/Explicit Casting",
                content: `### Definition\nCasting is the method of converting one data type into another. Implicit happens automatically; Explicit requires manual syntax.\n\n### Key Points\n- Implicit (Widening): Converting smaller types to larger (e.g., int to float).\n- Explicit (Narrowing): Converting larger types to smaller (e.g., double to int).\n- Explicit casting can lead to data loss (e.g., removing decimals).\n\n### Example\nint i = 10; float f = i; double d = 10.5; int j = (int)d;\n\n### Usage\nEssential when mixing different numeric types or handling polymorphic objects in Unity.`,
                lectures: [{ title: "C# Casting Tutorial", videoUrl: "https://www.youtube.com/watch?v=kYvVjAbe9t0" }]
            },
            {
                title: "007: Parse & TryParse",
                content: `### Definition\nMethods to convert string representations into numeric or boolean data types.\n\n### Key Points\n- Parse: Simplest but throws an error if text is invalid.\n- TryParse: Safest; returns a bool if successful instead of crashing.\n- Use TryParse for any data coming from a user or external file.\n\n### Example\nint.TryParse("100", out int result);\n\n### Usage\nProcessing UI TextFields, reading configuration files, or handling JSON data.`,
                lectures: [{ title: "Data Parsing Guide", videoUrl: "https://www.youtube.com/watch?v=0hOay2D9XG4" }]
            },
            {
                title: "008: Arithmetic Ops",
                content: `### Definition\nCore mathematical operators for calculation: Addition, Subtraction, Multiplication, and Division.\n\n### Key Points\n- Follows standard algebraic Order of Operations (PEMDAS).\n- Division result depends on types (int/int = int).\n- Be careful of overflow in large calculations.\n\n### Example\nint result = (10 + 5) * 2;\n\n### Usage\nPlayer movement, damage calculations, and physics vectors.`,
                lectures: [{ title: "C# Math Core", videoUrl: "https://www.youtube.com/watch?v=x_uL19g0qK0" }]
            },
            {
                title: "009: Modulo %",
                content: `### Definition\nThe remainder operator that returns what's left after a division.\n\n### Key Points\n- result = 10 % 3 (Result is 1).\n- Perfect for cyclic or repeating logic.\n- Keeps a value within a specific range.\n\n### Example\nif (frame % 60 == 0) // Every 60 frames\n\n### Usage\nWrapping coordinates, timing events, and determining parity (even/odd).`,
                lectures: [{ title: "Modulo Power", videoUrl: "https://www.youtube.com/watch?v=p5A7H8k55yU" }]
            },
            {
                title: "010: Inc/Dec ++ --",
                content: `### Definition\nShorthand operators to increase or decrease a variable by 1.\n\n### Key Points\n- Prefix (++x): Changes then returns.\n- Postfix (x++): Returns then changes.\n- Optimized for performance in loops.\n\n### Example\ncount++; lives--;\n\n### Usage\nLoop counters, ammo tracking, and score increments.`,
                lectures: [{ title: "Increments Guide", videoUrl: "https://www.youtube.com/watch?v=mD0kndv8M34" }]
            },
            {
                title: "011: Comparison Ops",
                content: `### Definition\nSymbols used to check relationships (equality, size) between values.\n\n### Key Points\n- result: bool (true/false).\n- Symbols: ==, !=, >, <, >=, <=.\n- Central to branching logic.\n\n### Example\nif (hp <= 0) Die();\n\n### Usage\nChecking win/loss, AI range detection, and input validation.`,
                lectures: [{ title: "Comparison Logic", videoUrl: "https://www.youtube.com/watch?v=kYvVjAbe9t0" }]
            },
            {
                title: "012: Logical Ops",
                content: `### Definition\nOperators to combine multiple boolean checks: AND (&&), OR (||), and NOT (!).\n\n### Key Points\n- && (AND): Both must be true.\n- || (OR): One must be true.\n- ! (NOT): Flips the value.\n\n### Example\nif (isGrounded && hasJumped) Jump();\n\n### Usage\nComplex condition checking for abilities and state transitions.`,
                lectures: [{ title: "Logical Logic", videoUrl: "https://www.youtube.com/watch?v=0hOay2D9XG4" }]
            },
            {
                title: "013: Bitwise XOR basics",
                content: `### Definition\nBitwise operations that manipulate individual binary bits of a number.\n\n### Key Points\n- XOR (^), AND (&), OR (|), NOT (~).\n- High-performance alternative to boolean arrays.\n- Primarily used with LayerMasks in Unity.\n\n### Example\nlayerMask = 1 << 5; // Layer 5\n\n### Usage\nOptimizing physics raycasts and compressed game states.`,
                lectures: [{ title: "Bitwise Mastery", videoUrl: "https://www.youtube.com/watch?v=x_uL19g0qK0" }]
            },
            {
                title: "014: Ternary Op",
                content: `### Definition\nA single-line 'if-else' that returns a value based on a condition.\n\n### Key Points\n- Syntax: condition ? true_val : false_val.\n- Keeps code clean for simple assignments.\n- Avoid nesting for readability.\n\n### Example\nstring state = hp > 0 ? "Alive" : "Dead";\n\n### Usage\nUI text updates and simple variable configuration.`,
                lectures: [{ title: "Ternary Shorthand", videoUrl: "https://www.youtube.com/watch?v=p5A7H8k55yU" }]
            },
            {
                title: "015: Null Coalescing",
                content: `### Definition\nOperators (??, ??=) that handle null values by providing a fallback.\n\n### Key Points\n- ??: Return right side if left is null.\n- ??=: Assign right to left if left is null.\n- Critical for 'Defensive Programming'.\n\n### Example\nvar name = inputName ?? "Guest";\n\n### Usage\nSafely handling optional references and configuration loading.`,
                lectures: [{ title: "Null Coalescing", videoUrl: "https://www.youtube.com/watch?v=mD0kndv8M34" }]
            },
            {
                title: "016: Null-Conditional",
                content: `### Definition\nThe (?.) operator that safely accesses members only if the object exists.\n\n### Key Points\n- Prevents 'NullReferenceException' crashes.\n- Returns null instead of throwing an error.\n- Can be chained (a?.b?.c).\n\n### Example\nplayer?.Jump();\n\n### Usage\nSafely calling events and cross-referencing between scripts.`,
                lectures: [{ title: "Safe Null Checks", videoUrl: "https://www.youtube.com/watch?v=kYvVjAbe9t0" }]
            },
            {
                title: "017: If/Else Flow",
                content: `### Definition\nThe most basic way to execute different code blocks based on conditions.\n\n### Key Points\n- If/Else-If/Else chain.\n- Executes only the first block whose condition is met.\n- Can be nested for deeper logic.\n\n### Example\nif(a) { ... } else if(b) { ... } else { ... }\n\n### Usage\nEvery decision made by the game world and AI.`,
                lectures: [{ title: "Control Flow", videoUrl: "https://www.youtube.com/watch?v=0hOay2D9XG4" }]
            },
            {
                title: "018: Switch States (Classic)",
                content: `### Definition\nA branching structure that compares a single variable against many possible values.\n\n### Key Points\n- Cleaner than long 'if-else' lists.\n- Effective for Enums and Integers.\n- Requires 'break' to stop fall-through.\n\n### Example\nswitch(day) { case Day.Mon: break; }\n\n### Usage\nGame state machines, menu navigation, and item types.`,
                lectures: [{ title: "Classic Switch", videoUrl: "https://www.youtube.com/watch?v=x_uL19g0qK0" }]
            },
            {
                title: "019: Switch Expressions",
                content: `### Definition\nA modern (C# 8+) concise syntax for switches that returns a result.\n\n### Key Points\n- Uses '=>' instead of 'case' and 'break'.\n- Much shorter and easier to read.\n- Uses '_' as the default discard.\n\n### Example\nint speed = mode switch { Hard => 10, _ => 5 };\n\n### Usage\nVariable configuration and complex lookups.`,
                lectures: [{ title: "Modern Switch", videoUrl: "https://www.youtube.com/watch?v=p5A7H8k55yU" }]
            },
            {
                title: "020: For Loops",
                content: `### Definition\nA loop structure for repeating code a fixed number of times.\n\n### Key Points\n- components: Init, Condition, Step.\n- Best when you know the iteration count.\n- Accessible index variable 'i'.\n\n### Example\nfor(int i=0; i<10; i++) { ... }\n\n### Usage\nSpawning arrays, batch updates, and mathematical iterations.`,
                lectures: [{ title: "For Loop Primer", videoUrl: "https://www.youtube.com/watch?v=mD0kndv8M34" }]
            },
            {
                title: "021: While Loops",
                content: `### Definition\nA loop that repeats as long as its condition remains true.\n\n### Key Points\n- Checks at the START of the loop.\n- Risk of infinite loops if logic is wrong.\n- Dynamic iteration count.\n\n### Example\nwhile(isRunning) tick();\n\n### Usage\nGame loops, network polling, and algorithmic searches.`,
                lectures: [{ title: "While Loops", videoUrl: "https://www.youtube.com/watch?v=kYvVjAbe9t0" }]
            },
            {
                title: "022: Do-While Loops",
                content: `### Definition\nA loop that executes once and then repeats while a condition is true.\n\n### Key Points\n- Checks at the END of the loop.\n- Guaranteed to run at least 1 time.\n- Useful for initialization tasks.\n\n### Example\ndo { init(); } while (!ready);\n\n### Usage\nValidation logic and retry attempts.`,
                lectures: [{ title: "Do-While Loops", videoUrl: "https://www.youtube.com/watch?v=0hOay2D9XG4" }]
            },
            {
                title: "023: Foreach Loops",
                content: `### Definition\nA high-level loop that visits every item in a collection directly.\n\n### Key Points\n- Read-only loop variable.\n- Cleanest syntax for Lists and Arrays.\n- No index management needed.\n\n### Example\nforeach (var item in items) { item.Use(); }\n\n### Usage\nProcessing game entities, cleaning inventories, and UI updates.`,
                lectures: [{ title: "Foreach Power", videoUrl: "https://www.youtube.com/watch?v=x_uL19g0qK0" }]
            },
            {
                title: "024: Break/Continue",
                content: `### Definition\nKeywords to skip parts of a loop or exit early.\n\n### Key Points\n- Break: Stop the loop entirely.\n- Continue: Skip the rest and go to next step.\n- Optimization tools for algorithms.\n\n### Example\nif(found) break; if(invalid) continue;\n\n### Usage\nSearching for targets and filtering collection processing.`,
                lectures: [{ title: "Break & Continue", videoUrl: "https://www.youtube.com/watch?v=p5A7H8k55yU" }]
            },
            {
                title: "025: Nested Loops",
                content: `### Definition\nLoops inside loops used for multi-dimensional data.\n\n### Key Points\n- Multiplies time complexity (O(n^2)).\n- Critical for grid systems.\n- Keep logic inside small for performance.\n\n### Example\nfor(x) for(y) grid[x,y].draw();\n\n### Usage\nMap generation and multi-layer simulations.`,
                lectures: [{ title: "Nested Ops", videoUrl: "https://www.youtube.com/watch?v=mD0kndv8M34" }]
            },
            {
                title: "026: Single-Dim Arrays",
                content: `### Definition\nBasic fixed-size collection of data in memory.\n\n### Key Points\n- Zero-indexing.\n- Fixed size once created.\n- High speed performance.\n\n### Example\nint[] arr = new int[5];\n\n### Usage\nPre-defined data tables and fixed asset lists.`,
                lectures: [{ title: "Arrays Core", videoUrl: "https://www.youtube.com/watch?v=kYvVjAbe9t0" }]
            },
            {
                title: "027: Multi-Dim Arrays",
                content: `### Definition\nRectangular grid collections like [,] for matrix-style storage.\n\n### Key Points\n- Fixed X and Y dimensions.\n- Memory-efficient for true rectangles.\n- Access via multi-index: a[x,y].\n\n### Example\nint[,] world = new int[10,10];\n\n### Usage\nChess boards and grid-based inventories.`,
                lectures: [{ title: "2D Arrays", videoUrl: "https://www.youtube.com/watch?v=0hOay2D9XG4" }]
            },
            {
                title: "028: Jagged Arrays",
                content: `### Definition\nAn array where each 'row' can have a different length.\n\n### Key Points\n- Array of arrays: [][].\n- Flexible memory for irregular data.\n- Each row must be initialized individually.\n\n### Example\nint[][] j = new int[3][];\n\n### Usage\nDungeon paths and dynamic story trees.`,
                lectures: [{ title: "Jagged Arrays", videoUrl: "https://www.youtube.com/watch?v=x_uL19g0qK0" }]
            },
            {
                title: "029: Array Methods",
                content: `### Definition\nUtility functions to manipulate arrays like Sorting and Clearing.\n\n### Key Points\n- Array.Sort(): Reorders data.\n- Array.Clear(): Sets memory to default values.\n- System.Linq adds even more power.\n\n### Example\nArray.Sort(scores);\n\n### Usage\nLeaderboards and data cleaning.`,
                lectures: [{ title: "Array Utils", videoUrl: "https://www.youtube.com/watch?v=p5A7H8k55yU" }]
            },
            {
                title: "030: List<T> Foundations",
                content: `### Definition\nThe most common dynamic collection for resizing data sets.\n\n### Key Points\n- Resizes automatically.\n- Broad set of functions (Add, Remove).\n- Reference type on the Heap.\n\n### Example\nList<int> list = new List<int>();\n\n### Usage\nActive enemies and inventory management.`,
                lectures: [{ title: "Lists 101", videoUrl: "https://www.youtube.com/watch?v=mD0kndv8M34" }]
            },
            {
                title: "031: List Add/Remove",
                content: `### Definition\nMethods to manage elements in a List dynamically.\n\n### Key Points\n- Add/AddRange: Insert at end.\n- RemoveAt: Delete by position.\n- Remove: Delete by value.\n\n### Example\nlist.Add("Sword"); list.Remove("Hat");\n\n### Usage\nReal-time item pickup and entity removal.`,
                lectures: [{ title: "List Ops", videoUrl: "https://www.youtube.com/watch?v=kYvVjAbe9t0" }]
            },
            {
                title: "032: List Search",
                content: `### Definition\nTechniques to find data within a dynamic List.\n\n### Key Points\n- Contains(): Found toggle.\n- IndexOf(): Position lookup.\n- Find(): Conditional lookup.\n\n### Example\nif(items.Contains(key)) ...\n\n### Usage\nValidating inventory and quest requirements.`,
                lectures: [{ title: "List Search", videoUrl: "https://www.youtube.com/watch?v=0hOay2D9XG4" }]
            },
            {
                title: "033: Capacity vs Count",
                content: `### Definition\nDifference between items stored (Count) and allocated memory (Capacity).\n\n### Key Points\n- Capacity doubles automatically when full.\n- Resizing causes performance lag (GC).\n- Set initial capacity to optimize.\n\n### Example\nList<int> l = new List<int>(1000);\n\n### Usage\nOptimizing performance for high-speed spawning.`,
                lectures: [{ title: "List Perf", videoUrl: "https://www.youtube.com/watch?v=x_uL19g0qK0" }]
            },
            {
                title: "034: Stack vs Heap",
                content: `### Definition\nThe two RAM segments for memory storage: Stack (Static) and Heap (Dynamic).\n\n### Key Points\n- Stack: Fast, safe, local value types.\n- Heap: Slower, flexible, reference types.\n- Heap requires Garbage Collection.\n\n### Example\nint i = 5; // Stack; List l = new List(); // Heap\n\n### Usage\nMemory optimization and leak prevention.`,
                lectures: [{ title: "C# Memory", videoUrl: "https://www.youtube.com/watch?v=p5A7H8k55yU" }]
            },
            {
                title: "035: String Concat/Interp",
                content: `### Definition\nCombining strings via either direct addition (+) or interpolation ($"").\n\n### Key Points\n- Interpolation: Most modern and readable.\n- Concatenation: Slower in huge loops.\n- StringBuilder is for heavy manipulation.\n\n### Example\nstring s = $"Hello {player}!";\n\n### Usage\nUI displays and debugging logs.`,
                lectures: [{ title: "String Formatting", videoUrl: "https://www.youtube.com/watch?v=mD0kndv8M34" }]
            },
            {
                title: "036: Substring/IndexOf",
                content: `### Definition\nParsing parts of a string based on position or finding specific symbols.\n\n### Key Points\n- IndexOf: Find first match.\n- Substring: Extract a slice.\n- Critical for text processing.\n\n### Example\ns.Substring(0, 5);\n\n### Usage\nParsing command consoles and dialogue systems.`,
                lectures: [{ title: "String Slicing", videoUrl: "https://www.youtube.com/watch?v=kYvVjAbe9t0" }]
            },
            {
                title: "037: Split, Join, Trim",
                content: `### Definition\nAdvanced string manipulation for cleaning and formatting text data.\n\n### Key Points\n- Split: String to Array.\n- Join: Array to String.\n- Trim: Remove whitespace.\n\n### Example\nstring[] words = s.Split(',');\n\n### Usage\nCSVD data reading and networking packet parsing.`,
                lectures: [{ title: "String Cleaning", videoUrl: "https://www.youtube.com/watch?v=0hOay2D9XG4" }]
            },
            {
                title: "038: Replace & Casing",
                content: `### Definition\nChanging parts of a string and normalizing capitalization.\n\n### Key Points\n- ToUpper/ToLower: Case normalization.\n- Replace: Swapping substrings.\n- Case-insensitive comparisons.\n\n### Example\nstring clean = s.ToUpper().Replace("A", "B");\n\n### Usage\nSearch filters and command parsing.`,
                lectures: [{ title: "String Normalization", videoUrl: "https://www.youtube.com/watch?v=x_uL19g0qK0" }]
            },
            {
                title: "039: StringBuilder Perf",
                content: `### Definition\nA high-performance object for building large strings in loops.\n\n### Key Points\n- Mutable (unlike standard strings).\n- Prevents memory fragmentation.\n- Use if doing >10 additions.\n\n### Example\nStringBuilder sb = new StringBuilder();\n\n### Usage\nGenerating procedural logs and large text documents.`,
                lectures: [{ title: "StringBuilder Guide", videoUrl: "https://www.youtube.com/watch?v=p5A7H8k55yU" }]
            },
            {
                title: "040: Enum Definition",
                content: `### Definition\nConstants that make code more readable by using words instead of numbers.\n\n### Key Points\n- Group related constants.\n- Improves type safety.\n- Highly used for discrete states.\n\n### Example\nenum State { Idle, Run, Jump }\n\n### Usage\nGame states, AI modes, and weapon types.`,
                lectures: [{ title: "Enums Masterclass", videoUrl: "https://www.youtube.com/watch?v=mD0kndv8M34" }]
            },
            {
                title: "041: Enum Casting",
                content: `### Definition\nConverting between Enums and their underlying numeric (int) values.\n\n### Key Points\n- Enums are integers behind the scenes.\n- Explicit cast: (int)MyEnum.Value.\n- Useful for database storage.\n\n### Example\nint val = (int)State.Idle; // val = 0\n\n### Usage\nSerialization and data loading.`,
                lectures: [{ title: "Enum Casting", videoUrl: "https://www.youtube.com/watch?v=kYvVjAbe9t0" }]
            },
            {
                title: "042: Flags Attribute",
                content: `### Definition\nA way to allow an Enum to store multiple values using binary logic.\n\n### Key Points\n- Decorate with [Flags].\n- Use powers of 2 for values (1, 2, 4, 8).\n- Combine with | operator.\n\n### Example\n[Flags] enum Options { None=0, A=1, B=2 }\n\n### Usage\nLayer masks, permission systems, and ability sets.`,
                lectures: [{ title: "Enums Flags", videoUrl: "https://www.youtube.com/watch?v=0hOay2D9XG4" }]
            },
            {
                title: "043: Method Signatures",
                content: `### Definition\nThe combination of a method's name and its parameters.\n\n### Key Points\n- Defines the 'Interface' of the method.\n- Return type is NOT part of the signature.\n- Unique signatures enable Overloading.\n\n### Example\nvoid Jump(float height); // Signature: Jump(float)\n\n### Usage\nAPI design and clean code structure.`,
                lectures: [{ title: "Method Docs", videoUrl: "https://www.youtube.com/watch?v=x_uL19g0qK0" }]
            },
            {
                title: "044: Ref, Out, In Params",
                content: `### Definition\nKeywords to pass data by reference rather than by value.\n\n### Key Points\n- Ref: In/Out access.\n- Out: Forces output only.\n- In: Read-only reference (Perf optimization).\n\n### Example\nvoid Move(ref float x); void GetPos(out int p);\n\n### Usage\nPhysics calculations and multi-return functions.`,
                lectures: [{ title: "Reference Params", videoUrl: "https://www.youtube.com/watch?v=p5A7H8k55yU" }]
            },
            {
                title: "045: Optional Params",
                content: `### Definition\nParameters that have a default value and can be omitted by the caller.\n\n### Key Points\n- Must be placed at the end of parameter list.\n- Simplifies method usage.\n- Less boilerplate than 100 overloads.\n\n### Example\nvoid Bark(float pitch = 1.0f);\n\n### Usage\nConfiguration methods and simple action triggers.`,
                lectures: [{ title: "Optional Params", videoUrl: "https://www.youtube.com/watch?v=mD0kndv8M34" }]
            },
            {
                title: "046: Method Overloading",
                content: `### Definition\nCreating multiple methods with the SAME name but DIFFERENT parameters.\n\n### Key Points\n- Enhances flexibility.\n- Compiler chooses based on arguments passed.\n- High-fidelity clean code practice.\n\n### Example\nvoid Attack(); void Attack(Item weapon);\n\n### Usage\nFlexible APIs (e.g., Damage() vs Damage(float amount)).`,
                lectures: [{ title: "Overloading Guide", videoUrl: "https://www.youtube.com/watch?v=kYvVjAbe9t0" }]
            },
            {
                title: "047: Recursion Basics",
                content: `### Definition\nA technique where a method calls itself to solve smaller sub-problems.\n\n### Key Points\n- Requires a 'Base Case' to stop.\n- Elegant for tree/branch logic.\n- Risk of Stack Overflow if too deep.\n\n### Example\nint Fact(int n) => n==1 ? 1 : n*Fact(n-1);\n\n### Usage\nPathfinding and organizational search.`,
                lectures: [{ title: "Recursion Primer", videoUrl: "https://www.youtube.com/watch?v=0hOay2D9XG4" }]
            },
            {
                title: "048: Try-Catch Errors",
                content: `### Definition\nException handling blocks that prevent your game from crashing on errors.\n\n### Key Points\n- Try: Suspicious code.\n- Catch: Emergency response.\n- Critical for stable release.\n\n### Example\ntry { Download(); } catch(e) { Log(e); }\n\n### Usage\nNetwork requests, file loading, and math safety.`,
                lectures: [{ title: "Exception Handling", videoUrl: "https://www.youtube.com/watch?v=x_uL19g0qK0" }]
            },
            {
                title: "049: Finally & Cleanup",
                content: `### Definition\nA block that always runs after try/catch, regardless of whether an error happened.\n\n### Key Points\n- Use for closing files or network ports.\n- Guarantees execution.\n- Essential for memory stability.\n\n### Example\nfinally { file.Close(); }\n\n### Usage\nDatabase connections and file I/O operations.`,
                lectures: [{ title: "Cleanup Logic", videoUrl: "https://www.youtube.com/watch?v=p5A7H8k55yU" }]
            },
            {
                title: "050: Throwing Exceptions",
                content: `### Definition\nManually triggering an error when a condition is dangerously invalid.\n\n### Key Points\n- 'throw' keyword.\n- Useful for debugging and validation.\n- Stops execution immediately for safety.\n\n### Example\nif(u == null) throw new Error();\n\n### Usage\nSanity checks in complex systems and API protection.`,
                lectures: [{ title: "Throwing Errors", videoUrl: "https://www.youtube.com/watch?v=mD0kndv8M34" }]
            },
            {
                title: "051: Custom Exceptions",
                content: `### Definition\nCreating your own specific error types for your game domain.\n\n### Key Points\n- Inherit from Exception class.\n- Makes debugging much more specific.\n- Professional standard for large games.\n\n### Example\nclass LowAmmoException : Exception { }\n\n### Usage\nGame-specific logic failure reporting.`,
                lectures: [{ title: "Custom Errors", videoUrl: "https://www.youtube.com/watch?v=kYvVjAbe9t0" }]
            },
            {
                title: "052: Nameof Operator",
                content: `### Definition\nReturns the name of a variable, method, or type as a string.\n\n### Key Points\n- Type-safe compared to hardcoded strings.\n- Doesn't break when you rename things.\n- Refactor-friendly.\n\n### Example\nLog(nameof(playerHealth)); // Outputs "playerHealth"\n\n### Usage\nLogging and UI property pathing.`,
                lectures: [{ title: "Nameof Operator", videoUrl: "https://www.youtube.com/watch?v=0hOay2D9XG4" }]
            },
            {
                title: "053: MathF Class",
                content: `### Definition\nUnity's math library for floating-point calculations (Sin, Cos, Clamp).\n\n### Key Points\n- Sin/Cos: Oscillations.\n- Clamp: Value bounding.\n- Lerp: Smooth transitions.\n\n### Example\nx = MathF.Clamp(x, 0, 10);\n\n### Usage\nEvery aspect of movement and visual smoothing.`,
                lectures: [{ title: "Unity MathF", videoUrl: "https://www.youtube.com/watch?v=x_uL19g0qK0" }]
            },
            {
                title: "054: Random Gen",
                content: `### Definition\nGenerating statistical unpredictability for gameplay variance.\n\n### Key Points\n- UnityEngine.Random.Range().\n- Random.value for percentages.\n- Critical for 'Juice' and Replayability.\n\n### Example\ndamage = Random.Range(5, 15);\n\n### Usage\nLoot drops, AI variance, and procedural logic.`,
                lectures: [{ title: "Randomness Unity", videoUrl: "https://www.youtube.com/watch?v=p5A7H8k55yU" }]
            },
            {
                title: "055: Bitwise AND, OR",
                content: `### Definition\nLower-level logical operations on the ones and zeros of a number.\n\n### Key Points\n- AND (&): Bit-masking.\n- OR (|): Bit-combining.\n- Extremely fast.\n\n### Example\nlayer = mask & current;\n\n### Usage\nPhysics layer filters and specialized flag storage.`,
                lectures: [{ title: "Bitwise 101", videoUrl: "https://www.youtube.com/watch?v=mD0kndv8M34" }]
            },
            {
                title: "056: Bit Shifting",
                content: `### Definition\nMoving bits to the left (<<) or right (>>) to multiply/divide by powers of 2.\n\n### Key Points\n- Fast math optimization.\n- Key for defining LayerMasks.\n- core of 'Flag' logic.\n\n### Example\nint mask = 1 << 3; // Bit 3 on\n\n### Usage\nBinary protocols and high-speed data encoding.`,
                lectures: [{ title: "Bit Shifting", videoUrl: "https://www.youtube.com/watch?v=kYvVjAbe9t0" }]
            },
            {
                title: "057: Structs Definition",
                content: `### Definition\nCustom value types used for grouping related variables (Vector3, Color).\n\n### Key Points\n- Passed by value (Copied).\n- Stored on the Stack.\n- Best for small, simple data chunks.\n\n### Example\nstruct Stats { int hp; int mp; }\n\n### Usage\nOptimizing performance for high-frequency data structures.`,
                lectures: [{ title: "C# Structs", videoUrl: "https://www.youtube.com/watch?v=0hOay2D9XG4" }]
            },
            {
                title: "058: Structs vs Classes",
                content: `### Definition\nUnderstanding when to use Value Types (Structs) vs Reference Types (Classes).\n\n### Key Points\n- Struct: Fast, shallow, local.\n- Class: Flexible, deep, global, GC-heavy.\n- Don't use Structs for huge data (>16 bytes).\n\n### Example\nVector3 is a Struct; GameObject is a Class.\n\n### Usage\nHigh-end project optimization and memory planning.`,
                lectures: [{ title: "Struct vs Class", videoUrl: "https://www.youtube.com/watch?v=x_uL19g0qK0" }]
            },
            {
                title: "059: DateTime C#",
                content: `### Definition\nThe library for handling time, dates, and historical timestamps.\n\n### Key Points\n- DateTime.Now.\n- TimeSpan for durations.\n- Formatting strings (HH:mm).\n\n### Example\nvar start = DateTime.Now;\n\n### Usage\nSave files, daily rewards, and server synchronization.`,
                lectures: [{ title: "Date & Time", videoUrl: "https://www.youtube.com/watch?v=p5A7H8k55yU" }]
            },
            {
                title: "060: Game Logic Intro",
                content: `### Definition\nCombining all C# Foundations into cohesive rules that drive gameplay.\n\n### Key Points\n- Loops + Ifs + Math = Game Engine.\n- Transition from syntax to 'Systems'.\n- Foundation for Unity Core.\n\n### Example\n(Enemy logic) If close move else idle.\n\n### Usage\nFinal step of foundations before entering Unity Engine mastery.`,
                lectures: [{ title: "Logic Architecture", videoUrl: "https://www.youtube.com/watch?v=mD0kndv8M34" }]
            }
        ];

        // Safe Update
        let updatedCount = 0;
        skill.topics.forEach(topic => {
            const enrichment = data.find(e => e.title === topic.title);
            if (enrichment) {
                topic.content = enrichment.content;
                topic.lectures = enrichment.lectures;
                updatedCount++;
            }
        });

        await skill.save();
        console.log(`UPLINK SUCCESS: Enriched ${updatedCount} topics (006-060).`);
        process.exit(0);
    } catch (err) {
        console.error("ENRICHMENT ERROR:", err);
        process.exit(1);
    }
}
enrichBatch();
