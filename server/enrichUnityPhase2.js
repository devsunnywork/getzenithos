const mongoose = require('mongoose');
const Skill = require('./models/Skill');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/zenith_os';

async function enrichPhase2() {
    try {
        await mongoose.connect(MONGO_URI);
        const skill = await Skill.findOne({ name: "Unity C# Masterclass (2025)" });

        if (!skill) {
            console.error("UPLINK FAILED: Skill not found.");
            process.exit(1);
        }

        const data = [
            {
                title: "061: Class vs Object",
                content: `### Definition\nA Class is a blueprint/template; an Object is a concrete instance of that class in memory.\n\n### Key Points\n- Class: Defines rules, fields, and behavior (Code).\n- Object: Created via 'new' keyword (Memory).\n- Multiple objects can be created from one class.\n\n### Example\nCar myCar = new Car(); // 'Car' is Class, 'myCar' is Object\n\n### Usage\nThe foundation of Object-Oriented Programming (OOP) in Unity.`,
                lectures: [{ title: "Classes vs Objects", videoUrl: "https://www.youtube.com/watch?v=kYvVjAbe9t0" }]
            },
            {
                title: "062: Encapsulation Props",
                content: `### Definition\nHiding internal state and requiring access through Properties (Getters/Setters) to protect data integrity.\n\n### Key Points\n- Prevents unauthorized modification.\n- Uses { get; set; } syntax.\n- Allows validation logic (e.g., Health cannot be < 0).\n\n### Example\npublic int Health { get; private set; }\n\n### Usage\nProtecting player stats, inventory counts, and secure data layers.`,
                lectures: [{ title: "Encapsulation Guide", videoUrl: "https://www.youtube.com/watch?v=0hOay2D9XG4" }]
            },
            {
                title: "063: Access Modifiers",
                content: `### Definition\nKeywords that define the visibility of a class, method, or variable to other parts of the code.\n\n### Key Points\n- public: Open to everyone.\n- private: Only this class.\n- protected: This class + children.\n- internal: Entire project (Assembly).\n\n### Example\nprivate float speed; public void Move() { ... }\n\n### Usage\nDesigning secure and clean APIs for your game systems.`,
                lectures: [{ title: "Access Modifiers", videoUrl: "https://www.youtube.com/watch?v=x_uL19g0qK0" }]
            },
            {
                title: "064: Internal Access",
                content: `### Definition\nA modifier that allows access to any code within the same DLL or Project Assembly, but not external usage.\n\n### Key Points\n- Default for classes with no modifier.\n- Useful for library development.\n- Hides complexity from other modules.\n\n### Example\ninternal class Pathfinder { ... }\n\n### Usage\nSub-systems that need to talk to each other but not be exposed to the main game logic.`,
                lectures: [{ title: "Internal Modifier", videoUrl: "https://www.youtube.com/watch?v=p5A7H8k55yU" }]
            },
            {
                title: "065: Constructors Core",
                content: `### Definition\nA special method that runs automatically when an object is created (instantiated).\n\n### Key Points\n- Same name as the Class.\n- No return type (not even void).\n- Sets up initial state.\n\n### Example\npublic Player() { health = 100; }\n\n### Usage\nInitializing non-MonoBehaviour classes (Inventory, Stats, Nodes).`,
                lectures: [{ title: "Constructors 101", videoUrl: "https://www.youtube.com/watch?v=mD0kndv8M34" }]
            },
            {
                title: "066: Constructor Chaining",
                content: `### Definition\nCalling one constructor from another within the same class to reduce code duplication.\n\n### Key Points\n- Uses the ': this()' syntax.\n- Best for optional parameters during setup.\n- Flow: Specific Constructor -> Generic Constructor.\n\n### Example\npublic Item(string n) : this(n, 1) { }\n\n### Usage\nCreating flexible object initialization options.`,
                lectures: [{ title: "Constructor Chaining", videoUrl: "https://www.youtube.com/watch?v=kYvVjAbe9t0" }]
            },
            {
                title: "067: Static Members",
                content: `### Definition\nVariables or methods belonging to the Class itself rather than any specific object instance.\n\n### Key Points\n- Shared across ALL instances.\n- Accessed via ClassName.Member.\n- 'static' keyword.\n\n### Example\npublic static int EnemyCount = 0;\n\n### Usage\nGlobal counters, utility functions, and settings.`,
                lectures: [{ title: "Static Keyword", videoUrl: "https://www.youtube.com/watch?v=0hOay2D9XG4" }]
            },
            {
                title: "068: Static Utility",
                content: `### Definition\nA class comprised entirely of static methods to provide helper functions.\n\n### Key Points\n- Cannot be instantiated.\n- Example: UnityEngine.MathF.\n- Great for pure logic.\n\n### Example\npublic static class Tools { public static void Log() ... }\n\n### Usage\nMath helpers, file parsers, and debug utilities.`,
                lectures: [{ title: "Static Tools", videoUrl: "https://www.youtube.com/watch?v=x_uL19g0qK0" }]
            },
            {
                title: "069: Static Constructors",
                content: `### Definition\nA special constructor that runs exactly once before the first reference to a class.\n\n### Key Points\n- Cannot have parameters.\n- Cannot be called manually.\n- Used for one-time setup.\n\n### Example\nstatic GameManager() { Debug.Log("System Init"); }\n\n### Usage\nLoading configuration files or initializing static databases.`,
                lectures: [{ title: "Static Constructors", videoUrl: "https://www.youtube.com/watch?v=p5A7H8k55yU" }]
            },
            {
                title: "070: Inheritance Logic",
                content: `### Definition\nThe ability for one class (Child) to acquire properties and methods from another (Parent).\n\n### Key Points\n- 'IS-A' relationship (Dog IS-A Animal).\n- Promotes code reuse.\n- Child can add new features.\n\n### Example\nclass Enemy : MonoBehaviour { ... }\n\n### Usage\nBase classes for Enemies, Items, and UI elements.`,
                lectures: [{ title: "Inheritance Basics", videoUrl: "https://www.youtube.com/watch?v=mD0kndv8M34" }]
            },
            {
                title: "071: Override vs Virtual",
                content: `### Definition\nKeywords enabling Polymorphism: 'Virtual' allows a method to be changed; 'Override' actually changes it.\n\n### Key Points\n- Parent uses 'virtual void Attack()'.\n- Child uses 'override void Attack()'.\n- Calls the most specific version at runtime.\n\n### Example\noverride public void Speak() { print("Woof"); }\n\n### Usage\nDifferent behaviors for common actions (e.g., every enemy attacks differently).`,
                lectures: [{ title: "Virtual & Override", videoUrl: "https://www.youtube.com/watch?v=kYvVjAbe9t0" }]
            },
            {
                title: "072: Sealed Modifiers",
                content: `### Definition\nA modifier that prevents a class from being inherited or a method from being overridden further.\n\n### Key Points\n- Terminates the inheritance chain.\n- Minor performance boost (devirtualization).\n- Design intent: "This is the final version".\n\n### Example\npublic sealed class Boss : Enemy { ... }\n\n### Usage\nSecurity systems and preventing unintended modification of core logic.`,
                lectures: [{ title: "Sealed Classes", videoUrl: "https://www.youtube.com/watch?v=0hOay2D9XG4" }]
            },
            {
                title: "073: Abstract Base",
                content: `### Definition\nA class that cannot be instantiated and is meant purely as a template for other classes.\n\n### Key Points\n- Can contain abstract (empty) methods.\n- Enforces a contract for children.\n- Ideal for broad categories.\n\n### Example\npublic abstract class Shape { ... }\n\n### Usage\nBase classes like 'Weapon', 'Vehicle', or 'Quest'.`,
                lectures: [{ title: "Abstract Classes", videoUrl: "https://www.youtube.com/watch?v=x_uL19g0qK0" }]
            },
            {
                title: "074: Abstract Methods",
                content: `### Definition\nA method signature inside an abstract class with no body. Children MUST implement it.\n\n### Key Points\n- forces compliance.\n- Compile-time error if missing in child.\n- No default behavior allowed.\n\n### Example\npublic abstract void Fire();\n\n### Usage\nEnsuring all Weapons have a 'Fire()' method, but leaving the 'how' to them.`,
                lectures: [{ title: "Abstract Methods", videoUrl: "https://www.youtube.com/watch?v=p5A7H8k55yU" }]
            },
            {
                title: "075: Interfaces Contracts",
                content: `### Definition\nA purely abstract definition that lists methods/properties a class must implement. Like a contract.\n\n### Key Points\n- Uses 'interface' keyword (naming convention: IName).\n- Cannot contain fields or bodies (traditionally).\n- A class can implement multiple interfaces.\n\n### Example\ninterface IDamageable { void TakeHit(int dmg); }\n\n### Usage\nDecoupling systems - allowing interaction with anything 'Damageable' regardless of type.`,
                lectures: [{ title: "Interface Power", videoUrl: "https://www.youtube.com/watch?v=mD0kndv8M34" }]
            },
            {
                title: "076: Multiple Interfaces",
                content: `### Definition\nC# allows a class to sign multiple contracts (implement multiple interfaces) simultaneously.\n\n### Key Points\n- Solves the 'single inheritance' limit of classes.\n- Example: public class Door : IInteractable, IDamageable, ILockable.\n- Highly flexible architecture.\n\n### Example\nclass Robot : IMove, ITalk { ... }\n\n### Usage\nComplex entities that need to derive behaviors from many different systems.`,
                lectures: [{ title: "Multiple Interfaces", videoUrl: "https://www.youtube.com/watch?v=kYvVjAbe9t0" }]
            },
            {
                title: "077: Interface vs Abstract",
                content: `### Definition\nChoosing between 'IS-A' (Abstract) and 'CAN-DO' (Interface) relationships.\n\n### Key Points\n- Abstract: Shared code + Contract (Single Parent).\n- Interface: Contract ONLY (Multiple Parents).\n- Use Abstract for shared core logic; Interface for capabilities.\n\n### Example\nBird is Animal (Abstract); Bird is IFlyable (Interface).\n\n### Usage\nArchitectural planning for scalable game systems.`,
                lectures: [{ title: "Interface vs Abstract", videoUrl: "https://www.youtube.com/watch?v=0hOay2D9XG4" }]
            },
            {
                title: "078: Explicit Impl",
                content: `### Definition\nImplementing an interface method such that it is only accessible via the interface reference, not the class.\n\n### Key Points\n- Resolves naming conflicts (two interfaces having same method).\n- Hides API clutter from the main class.\n- Syntax: void IInterface.Method().\n\n### Example\n((ISave)player).Save();\n\n### Usage\nClean API design when a class handles many different system responsibilities.`,
                lectures: [{ title: "Explicit Interface", videoUrl: "https://www.youtube.com/watch?v=x_uL19g0qK0" }]
            },
            {
                title: "079: Dynamic Polymorphism",
                content: `### Definition\nThe ability to treat different objects as their common base type at runtime.\n\n### Key Points\n- List<Enemy> can hold Orcs, Elves, Dragons.\n- calling .Attack() on the list triggers specific behaviors.\n- The magic of 'virtual' and 'override'.\n\n### Example\nforeach(var e in enemies) e.Attack();\n\n### Usage\nUnit managers, inventory systems, and event handlers.`,
                lectures: [{ title: "Polymorphism Core", videoUrl: "https://www.youtube.com/watch?v=p5A7H8k55yU" }]
            },
            {
                title: "080: Composition Logic",
                content: `### Definition\nBuilding complex objects by combining smaller, independent components rather than deep inheritance trees.\n\n### Key Points\n- 'HAS-A' relationship (Car HAS-A Engine).\n- Unity's Component system is built on this.\n- More flexible than inheritance.\n\n### Example\nplayer.AddComponent<Health>();\n\n### Usage\nModular design favored by Unity dev (ECS, Components).`,
                lectures: [{ title: "Composition > Inheritance", videoUrl: "https://www.youtube.com/watch?v=mD0kndv8M34" }]
            },
            {
                title: "081: Generic Classes",
                content: `### Definition\nClasses that define their logic without specifying the exact data type until instantiation.\n\n### Key Points\n- Uses <T> syntax.\n- Write once, work with any type.\n- Example: List<T> is a generic class.\n\n### Example\npublic class Box<T> { public T item; }\n\n### Usage\nInventory slots, state machines, and data wrappers.`,
                lectures: [{ title: "Generic Classes", videoUrl: "https://www.youtube.com/watch?v=kYvVjAbe9t0" }]
            },
            {
                title: "082: Generic Methods",
                content: `### Definition\nMethods that can process different data types using a type parameter.\n\n### Key Points\n- Syntax: void Method<T>(T item).\n- Avoids code duplication (overloading for every type).\n- Unity's GetComponent<T>() is the prime example.\n\n### Example\nT Swap<T>(ref T a, ref T b);\n\n### Usage\nUtility functions, serialization, and component fetching.`,
                lectures: [{ title: "Generic Methods", videoUrl: "https://www.youtube.com/watch?v=0hOay2D9XG4" }]
            },
            {
                title: "083: Type Constraints",
                content: `### Definition\nRestricting what types can be used with a Generic <T> to ensure safety.\n\n### Key Points\n- where T : class (Must be ref type).\n- where T : MonoBehaviour (Must be Unity component).\n- where T : new() (Must have constructor).\n\n### Example\nclass Pool<T> where T : Component\n\n### Usage\nObject pooling systems and strictly typed managers.`,
                lectures: [{ title: "Generic Constraints", videoUrl: "https://www.youtube.com/watch?v=x_uL19g0qK0" }]
            },
            {
                title: "084: Dictionary Collections",
                content: `### Definition\nA collection of Key-Value pairs allowing generic, fast lookups.\n\n### Key Points\n- Access via Key (O(1) complexity) instead of looping.\n- Keys must be unique.\n- Unordered storage.\n\n### Example\nDictionary<string, int> scores = new Dictionary<string, int>();\n\n### Usage\nInventory by ID, stats lookup, and localization tables.`,
                lectures: [{ title: "Dictionary Guide", videoUrl: "https://www.youtube.com/watch?v=p5A7H8k55yU" }]
            },
            {
                title: "085: HashSet Uniqueness",
                content: `### Definition\nA high-performance bucket of items that guarantees no duplicates.\n\n### Key Points\n- Adding a duplicate is ignored.\n- Extremely fast .Contains() checks.\n- Index-less (Mathematics Set theory).\n\n### Example\nHashSet<int> activeIDs = new HashSet<int>();\n\n### Usage\nTracking unique active quests, selected items, or visited nodes.`,
                lectures: [{ title: "HashSet Mastery", videoUrl: "https://www.youtube.com/watch?v=mD0kndv8M34" }]
            },
            {
                title: "086: Queue T (FIFO)",
                content: `### Definition\nA First-In-First-Out (FIFO) collection. Like a line at a store.\n\n### Key Points\n- Enqueue (Add to back).\n- Dequeue (Remove from front).\n- Peek (Look at front).\n\n### Example\nQueue<Command> commandQueue = new Queue<Command>();\n\n### Usage\nCommand buffers, turn-based action queues, and message processing.`,
                lectures: [{ title: "Queue & Stack", videoUrl: "https://www.youtube.com/watch?v=kYvVjAbe9t0" }]
            },
            {
                title: "087: Stack T (LIFO)",
                content: `### Definition\nA Last-In-First-Out (LIFO) collection. Like a stack of plates.\n\n### Key Points\n- Push (Add to top).\n- Pop (Remove from top).\n- Common for 'Undo' systems/history.\n\n### Example\nStack<Menu> menuHistory = new Stack<Menu>();\n\n### Usage\nMenu navigation (Back button), Undo features, and state history.`,
                lectures: [{ title: "LIFO Stacks", videoUrl: "https://www.youtube.com/watch?v=0hOay2D9XG4" }]
            },
            {
                title: "088: Sorted Collections",
                content: `### Definition\nVariants like SortedList and SortedDictionary that automatically keep elements ordered.\n\n### Key Points\n- Slower insertion (O(log n)) due to sorting.\n- Automatically ordered by Key.\n- Good for rankings.\n\n### Example\nSortedList<int, Player> leaderboard;\n\n### Usage\nLeaderboards, priority queues, and timeline events.`,
                lectures: [{ title: "Sorted Collections", videoUrl: "https://www.youtube.com/watch?v=x_uL19g0qK0" }]
            },
            {
                title: "089: IEnumerable Pattern",
                content: `### Definition\nThe interface that allows a collection to be iterated over using 'foreach'.\n\n### Key Points\n- Returns an IEnumerator.\n- Allows custom classes to be looped.\n- Core of LINQ and coroutines.\n\n### Example\npublic IEnumerator GetEnumerator() { ... }\n\n### Usage\nCustom inventory systems that behave like arrays.`,
                lectures: [{ title: "IEnumerable Pattern", videoUrl: "https://www.youtube.com/watch?v=p5A7H8k55yU" }]
            },
            {
                title: "090: Yield Return",
                content: `### Definition\nSpecial keyword that builds an iterator state machine. Pauses execution and returns a value.\n\n### Key Points\n- Used in Coroutines for timing.\n- Used in IEnumerable for lazy evaluation.\n- Saves memory by not creating a full list.\n\n### Example\nyield return new WaitForSeconds(1);\n\n### Usage\nCoroutines, time delays, and streaming large data sets.`,
                lectures: [{ title: "Yield Return", videoUrl: "https://www.youtube.com/watch?v=mD0kndv8M34" }]
            },
            {
                title: "091: Single Delegates",
                content: `### Definition\nA variable that holds a reference to a method. A function pointer.\n\n### Key Points\n- Decouples caller from the method.\n- Define signature -> Assign method -> Invoke.\n- Basis of Events.\n\n### Example\ndelegate void Attack(); Attack myAttack = SwordSwing;\n\n### Usage\nCallback systems and flexible AI logic.`,
                lectures: [{ title: "Delegates Guide", videoUrl: "https://www.youtube.com/watch?v=kYvVjAbe9t0" }]
            },
            {
                title: "092: Multi-cast Delegates",
                content: `### Definition\nA delegate that holds references to MULTIPLE methods and calls them all when invoked.\n\n### Key Points\n- Use += to add, -= to remove.\n- Calls in order of addition.\n- If one crashes, the chain stops (be careful).\n\n### Example\nonDeath += dropLoot; onDeath += playSound;\n\n### Usage\nBroadcasting events like 'LevelComplete' or 'PlayerDied'.`,
                lectures: [{ title: "Multicast Delegates", videoUrl: "https://www.youtube.com/watch?v=0hOay2D9XG4" }]
            },
            {
                title: "093: Anonymous Methods",
                content: `### Definition\nDefining a method body inline without giving it a name.\n\n### Key Points\n- Old syntax: delegate(int x) { ... }\n- Precursor to Lambdas.\n- Useful for one-off callbacks.\n\n### Example\naction += delegate { print("Done"); };\n\n### Usage\nQuick UI listeners or simple callback logic.`,
                lectures: [{ title: "Anonymous Methods", videoUrl: "https://www.youtube.com/watch?v=x_uL19g0qK0" }]
            },
            {
                title: "094: Lambda Expressions",
                content: `### Definition\nThe modern, concise way to write anonymous functions using '=>'.\n\n### Key Points\n- Syntax: (input) => expression.\n- Capture local variables (Closure).\n- Extremely common with LINQ.\n\n### Example\nlist.Find(x => x.id == 5);\n\n### Usage\nLINQ queries, event subscriptions, and functional logic.`,
                lectures: [{ title: "Lambda Expressions", videoUrl: "https://www.youtube.com/watch?v=p5A7H8k55yU" }]
            },
            {
                title: "095: Action T Generic",
                content: `### Definition\nA built-in generic delegate for methods that return VOID.\n\n### Key Points\n- Action<int>: Method taking int, returning void.\n- No need to define custom delegates.\n- Supports up to 16 arguments.\n\n### Example\npublic Action<float> OnHeal;\n\n### Usage\nThe standard for void events in modern Unity C#.`,
                lectures: [{ title: "Action Delegates", videoUrl: "https://www.youtube.com/watch?v=mD0kndv8M34" }]
            },
            {
                title: "096: Func T Generic",
                content: `### Definition\nA built-in generic delegate for methods that RETURN a value.\n\n### Key Points\n- Func<int, bool>: Takes int, returns bool.\n- Last type param is ALWAYS the return type.\n- Useful for data fetching callbacks.\n\n### Example\nFunc<int> GetHealth;\n\n### Usage\nAI utility scores, value calculation callbacks, and predicates.`,
                lectures: [{ title: "Func Delegates", videoUrl: "https://www.youtube.com/watch?v=kYvVjAbe9t0" }]
            },
            {
                title: "097: Predicate T",
                content: `### Definition\nA specific delegate (Func<T, bool>) that represents a condition check.\n\n### Key Points\n- Always returns true/false.\n- Used heavily by List.Find() and related methods.\n- Semantic meaning: "Does this match?"\n\n### Example\nPredicate<Player> isDead = p => p.hp <= 0;\n\n### Usage\nFiltering lists and validating search conditions.`,
                lectures: [{ title: "Predicates Guide", videoUrl: "https://www.youtube.com/watch?v=0hOay2D9XG4" }]
            },
            {
                title: "098: Event Pattern",
                content: `### Definition\nA wrapper around delegates that adds protection. Only the owner can Invoke; others can only Subscribe (+=).\n\n### Key Points\n- Keyword: 'event'.\n- Prevents external classes from clearing the list (= null).\n- Professional standard for Observer pattern.\n\n### Example\npublic event Action OnJump;\n\n### Usage\nAll gameplay events (Attack, Jump, Die, Win).`,
                lectures: [{ title: "C# Events", videoUrl: "https://www.youtube.com/watch?v=x_uL19g0qK0" }]
            },
            {
                title: "099: Event Handlers",
                content: `### Definition\nThe standard .NET pattern for events using (object sender, EventArgs e).\n\n### Key Points\n- Ensures sender info is passed.\n- Allows passing custom data via EventArgs.\n- Standard in heavy enterprise apps, less common in simple games.\n\n### Example\nvoid HandleClick(object s, EventArgs e)\n\n### Usage\nUI libraries and complex system integration.`,
                lectures: [{ title: "EventHandler Pattern", videoUrl: "https://www.youtube.com/watch?v=p5A7H8k55yU" }]
            },
            {
                title: "100: Garbage Collection",
                content: `### Definition\nThe automatic process C# uses to clear unused memory (Heap) to free space.\n\n### Key Points\n- Triggered when memory fills up.\n- Causes CPU spikes (Lag frames).\n- Coding goal: Minimize allocation (garbage) in update loops.\n\n### Example\navoid 'new' in Update();\n\n### Usage\nPerformance optimization and understanding lag spikes.`,
                lectures: [{ title: "Garbage Collection", videoUrl: "https://www.youtube.com/watch?v=mD0kndv8M34" }]
            },
            {
                title: "101: LINQ Where",
                content: `### Definition\nA LINQ method to filter a collection based on a condition.\n\n### Key Points\n- Returns a new filtered list (IEnumerable).\n- Uses lambda syntax.\n- SQL-like querying for C# objects.\n\n### Example\nvar living = list.Where(x => x.alive);\n\n### Usage\nSelecting specific units, items, or nodes from a large list.`,
                lectures: [{ title: "LINQ Where", videoUrl: "https://www.youtube.com/watch?v=kYvVjAbe9t0" }]
            },
            {
                title: "102: LINQ Select",
                content: `### Definition\nA projection method that transforms items in a list into something else.\n\n### Key Points\n- Maps X to Y.\n- Useful for extracting IDs from objects.\n- Creates a new stream of data.\n\n### Example\nvar names = players.Select(p => p.name);\n\n### Usage\nExtracting data for UI lists or data processing.`,
                lectures: [{ title: "LINQ Select", videoUrl: "https://www.youtube.com/watch?v=0hOay2D9XG4" }]
            },
            {
                title: "103: LINQ Group/Join",
                content: `### Definition\nAdvanced LINQ for grouping items by key or joining two lists together.\n\n### Key Points\n- GroupBy: Buckets items.\n- Join: SQL-style table merging.\n- Powerful for complex data analysis.\n\n### Example\nvar groups = enemies.GroupBy(e => e.type);\n\n### Usage\nOrganizing inventory by category or combining user data.`,
                lectures: [{ title: "Advanced LINQ", videoUrl: "https://www.youtube.com/watch?v=x_uL19g0qK0" }]
            },
            {
                title: "104: LINQ First/Last",
                content: `### Definition\nRetrieving specific elements from a sequence.\n\n### Key Points\n- First(): Crashes if none found.\n- FirstOrDefault(): Returns null/0 if none found (Safer).\n- Last(): Grabs the end.\n\n### Example\nvar boss = enemies.FirstOrDefault(e => e.isBoss);\n\n### Usage\nFinding unique entites or checking for existence.`,
                lectures: [{ title: "LINQ First/Last", videoUrl: "https://www.youtube.com/watch?v=p5A7H8k55yU" }]
            },
            {
                title: "105: LINQ Math Helpers",
                content: `### Definition\nQuick statistical methods built into LINQ (Sum, Min, Max, Average).\n\n### Key Points\n- Immediate calculation.\n- Great for RPG stats.\n- Clean syntax over loops.\n\n### Example\nfloat avgHp = enemies.Average(e => e.hp);\n\n### Usage\nCalculating team scores, DPS analysis, and difficulty scaling.`,
                lectures: [{ title: "LINQ Math", videoUrl: "https://www.youtube.com/watch?v=mD0kndv8M34" }]
            },
            {
                title: "106: Extension Methods",
                content: `### Definition\nAdding new methods to existing types (like int, String, or Transform) without modifying source code.\n\n### Key Points\n- Static class with 'this' keyword.\n- Appears as a native method.\n- Fantastic for utility libraries.\n\n### Example\npublic static void Reset(this Transform t) { ... }\n\n### Usage\nBuilding a robust 'Tools' library for your team.`,
                lectures: [{ title: "Extension Methods", videoUrl: "https://www.youtube.com/watch?v=kYvVjAbe9t0" }]
            },
            {
                title: "107: Partial Classes",
                content: `### Definition\nSplitting a single class definition across multiple files.\n\n### Key Points\n- Keyword 'partial'.\n- Complies into one class.\n- Used for generated code (UI, Input System).\n\n### Example\npartial class Player { ...combat... } partial class Player { ...move... }\n\n### Usage\nManaging massive classes or separating generated code from logic.`,
                lectures: [{ title: "Partial Classes", videoUrl: "https://www.youtube.com/watch?v=0hOay2D9XG4" }]
            },
            {
                title: "108: [Obsolete] Attributes",
                content: `### Definition\nMarking code as outdated so the compiler warns users not to use it.\n\n### Key Points\n- [Obsolete("Message")].\n- Can treat as Error (true) or Warning.\n- Critical for API evolution.\n\n### Example\n[Obsolete("Use NewMove()")] void Move() {}\n\n### Usage\nDeprecating legacy systems without breaking code immediately.`,
                lectures: [{ title: "Obsolete Attribute", videoUrl: "https://www.youtube.com/watch?v=x_uL19g0qK0" }]
            },
            {
                title: "109: [SerializeField] Intro",
                content: `### Definition\nThe Unity-specific attribute to show private fields in the Inspector.\n\n### Key Points\n- Keeps encapsulation (private) while allowing design (Inspector).\n- The golden standard for Unity variables.\n- Does not work on static/const.\n\n### Example\n[SerializeField] private int speed;\n\n### Usage\nExposing tuning values to designers without breaking code privacy.`,
                lectures: [{ title: "SerializeField", videoUrl: "https://www.youtube.com/watch?v=p5A7H8k55yU" }]
            },
            {
                title: "110: Reflection API",
                content: `### Definition\nCode that inspects other code at runtime. Reading types, methods, and fields dynamically.\n\n### Key Points\n- Very powerful but Slow.\n- System.Reflection namespace.\n- Can access private members.\n\n### Example\nvar methods = type.GetMethods();\n\n### Usage\nModding systems, debug consoles, and custom editor tools.`,
                lectures: [{ title: "C# Reflection", videoUrl: "https://www.youtube.com/watch?v=mD0kndv8M34" }]
            },
            {
                title: "111: Inspecting Methods",
                content: `### Definition\nUsing Reflection to find and invoke methods by name.\n\n### Key Points\n- MethodInfo.Invoke().\n- Requires knowing parameters.\n- Useful for automated testing.\n\n### Example\nmethod.Invoke(obj, null);\n\n### Usage\nCheat consoles and command parsing systems.`,
                lectures: [{ title: "Reflection Invoke", videoUrl: "https://www.youtube.com/watch?v=kYvVjAbe9t0" }]
            },
            {
                title: "112: Dynamic Keyword",
                content: `### Definition\nBypasses compile-time type checking. The types are resolved at runtime.\n\n### Key Points\n- Disables IntelliSense.\n- Risky (Runtime errors).\n- Used for interacting with Python/JSON or COM.\n\n### Example\ndynamic data = GetJson();\n\n### Usage\nProcessing untyped JSON data or plug-in communication.`,
                lectures: [{ title: "Dynamic C#", videoUrl: "https://www.youtube.com/watch?v=0hOay2D9XG4" }]
            },
            {
                title: "113: File Text I/O",
                content: `### Definition\nReading and Writing text files to the operating system.\n\n### Key Points\n- System.IO namespace.\n- File.ReadAllText / WriteAllText.\n- Use persistentDataPath in Unity.\n\n### Example\nFile.WriteAllText(path, "Save");\n\n### Usage\nSaving game progress, logs, and configuration files.`,
                lectures: [{ title: "File IO", videoUrl: "https://www.youtube.com/watch?v=x_uL19g0qK0" }]
            },
            {
                title: "114: Binary Serial",
                content: `### Definition\nConverting object data into binary streams (byte arrays) for storage.\n\n### Key Points\n- More efficient/secure than text.\n- BinaryFormatter (Legacy) vs custom writers.\n- Harder to edit manually.\n\n### Example\nwriter.Write(health);\n\n### Usage\nSave files that players shouldn't be able to hack easily.`,
                lectures: [{ title: "Binary Serialization", videoUrl: "https://www.youtube.com/watch?v=p5A7H8k55yU" }]
            },
            {
                title: "115: JsonUtility",
                content: `### Definition\nUnity's built-in, fast JSON serializer.\n\n### Key Points\n- ToJson() and FromJson<T>().\n- Limitations: No Dictionaries, no private fields (unless serialized).\n- Extremely fast within Unity.\n\n### Example\nstring json = JsonUtility.ToJson(player);\n\n### Usage\nWeb API requests and human-readable save files.`,
                lectures: [{ title: "JsonUtility Guide", videoUrl: "https://www.youtube.com/watch?v=mD0kndv8M34" }]
            },
            {
                title: "116: Threading Basics",
                content: `### Definition\nRunning code in parallel on a separate CPU core to prevent freezing the main game.\n\n### Key Points\n- Main Thread: Unity API (Transform, etc.) lives here.\n- Background Thread: Math, Data, Network.\n- Don't touch Unity API from background!\n\n### Example\nThread t = new Thread(Calculation);\n\n### Usage\nHeavy pathfinding, procedural gen, and networking.`,
                lectures: [{ title: "Threading Intro", videoUrl: "https://www.youtube.com/watch?v=kYvVjAbe9t0" }]
            },
            {
                title: "117: Task Pattern",
                content: `### Definition\nThe modern replacement for Threads using the System.Threading.Tasks library.\n\n### Key Points\n- Task.Run().\n- Supports return values and cancellation.\n- Integrates with async/await.\n\n### Example\nawait Task.Run(() => HeavyWork());\n\n### Usage\nModern asynchronous operations in C#.`,
                lectures: [{ title: "Tasks & Async", videoUrl: "https://www.youtube.com/watch?v=0hOay2D9XG4" }]
            },
            {
                title: "118: Async Exception",
                content: `### Definition\nHandling errors that occur in background tasks, which don't crash the main thread.\n\n### Key Points\n- Exceptions in async void methods can crash the app.\n- Use try/catch within the async task.\n- Task-based exceptions propagate to the awaiter.\n\n### Example\ntry { await Task; } catch(e) { ... }\n\n### Usage\nRobust networking and background loading systems.`,
                lectures: [{ title: "Async Exceptions", videoUrl: "https://www.youtube.com/watch?v=x_uL19g0qK0" }]
            },
            {
                title: "119: IDisposable Pattern",
                content: `### Definition\nA standard interface for releasing unmanaged resources (File Handles, Streams).\n\n### Key Points\n- Implements Dispose() method.\n- Enables the 'using' block syntax.\n- Prevents memory leaks.\n\n### Example\nusing(var fs = new FileStream(...)) { ... }\n\n### Usage\nFile management, network sockets, and streams.`,
                lectures: [{ title: "IDisposable", videoUrl: "https://www.youtube.com/watch?v=p5A7H8k55yU" }]
            },
            {
                title: "120: SOLID Principles",
                content: `### Definition\nThe 5 commandments of good OOP architecture (SRP, OCP, LSP, ISP, DIP).\n\n### Key Points\n- Write code that is easy to maintain and extend.\n- Decouples systems.\n- The mark of a Senior Developer.\n\n### Example\nSingle Responsibility: A class does one thing.\n\n### Usage\nArchitecting scalable, professional game codebases.`,
                lectures: [{ title: "SOLID for Unity", videoUrl: "https://www.youtube.com/watch?v=mD0kndv8M34" }]
            }
        ];

        // Safe Update Logic
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
        console.log(`UPLINK SUCCESS: Enriched ${updatedCount} topics (061-120).`);
        process.exit(0);
    } catch (err) {
        console.error("ENRICHMENT ERROR:", err);
        process.exit(1);
    }
}
enrichPhase2();
