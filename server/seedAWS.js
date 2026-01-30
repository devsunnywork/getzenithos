const mongoose = require('mongoose');
const Skill = require('./models/Skill');

// --- Helper for Consistent ObjectIds ---
const getObjectId = (str) => {
    // Generate a deterministic ObjectId based on the string
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = ((hash << 5) - hash) + str.charCodeAt(i);
        hash |= 0; // Convert to 32bit integer
    }
    const hex = Math.abs(hash).toString(16).padStart(24, '0');
    return new mongoose.Types.ObjectId(hex);
};

const awsStructure = [
    // --- 1. Introduction ---
    {
        id: 'aws-intro',
        title: 'Introduction to AWS',
        type: 'main',
        desc: 'Overview of Amazon Web Services, cloud computing concepts, and global infrastructure.',
        content: `
# Introduction to AWS

Amazon Web Services (AWS) is a secure cloud services platform, offering compute power, database storage, content delivery and other functionality to help businesses scale and grow.

### Key Concepts
*   **What is Cloud Computing?**: The on-demand delivery of IT resources over the Internet with pay-as-you-go pricing.
*   **Benefits**:
    *   **Agility**: Fail fast, scale fast.
    *   **Elasticity**: Scale resources up or down based on demand.
    *   **Cost Savings**: Trade capital expense for variable expense.
*   **Deployment Models**: Public Cloud (AWS, Azure), Private Cloud (On-premise), Hybrid Cloud.
*   **Service Models**:
    *   **IaaS (Infrastructure as a Service)**: EC2, VPC (You manage OS + App).
    *   **PaaS (Platform as a Service)**: RDS, Elastic Beanstalk (AWS manages OS).
    *   **SaaS (Software as a Service)**: Gmail, Salesforce (Provider manages everything).
        `,
        pos: { x: 0, y: 0 }
    },
    {
        id: 'global-infra',
        title: 'Global Infrastructure',
        type: 'branch',
        parent: 'aws-intro',
        desc: 'Regions, Availability Zones, and Edge Locations.',
        content: `
# AWS Global Infrastructure

*   **Regions**: A physical location in the world where we have multiple Availability Zones. (e.g., us-east-1, eu-west-1).
*   **Availability Zones (Abs)**: One or more discrete data centers with redundant power, networking, and connectivity in an AWS Region.
*   **Edge Locations**: Endpoints for AWS which are used for caching content. Typically, this consists of CloudFront, Amazon's content delivery network (CDN).
        `,
        pos: { x: 300, y: -100 }
    },
    {
        id: 'shared-resp',
        title: 'Shared Responsibility',
        type: 'branch',
        parent: 'aws-intro',
        desc: 'Security OF the cloud vs Security IN the cloud.',
        content: `
# Shared Responsibility Model

Security and Compliance is a shared responsibility between AWS and the customer.

*   **AWS Responsibility ("Security OF the Cloud")**:
    *   Physical security of data centers.
    *   Hardware and software infrastructure.
    *   Network infrastructure.
    *   Virtualization layer.
*   **Customer Responsibility ("Security IN the Cloud")**:
    *   Guest OS (patches, updates).
    *   Application software.
    *   Security Group / Firewall configuration.
    *   Data encryption (at rest and in transit).
        `,
        pos: { x: 300, y: 0 }
    },
    {
        id: 'well-arch',
        title: 'Well Architected Framework',
        type: 'branch',
        parent: 'aws-intro',
        desc: 'Operational Excellence, Security, Reliability, Performance, Cost, Sustainability.',
        content: `
# AWS Well-Architected Framework

Helps cloud architects build secure, high-performing, resilient, and efficient infrastructure for their applications and workloads.

### The 6 Pillars
1.  **Operational Excellence**: Running and monitoring systems to deliver business value, and continually improving processes and procedures.
2.  **Security**: Protecting information and systems.
3.  **Reliability**: Ensuring a workload performs its intended function correctly and consistently when it's expected to.
4.  **Performance Efficiency**: Using IT and computing resources efficiently.
5.  **Cost Optimization**: Avoiding unnecessary costs.
6.  **Sustainability**: Minimizing the environmental impacts of running cloud workloads.
        `,
        pos: { x: 300, y: 100 }
    },

    // --- 2. IAM ---
    {
        id: 'iam',
        title: 'IAM (Identity)',
        type: 'main',
        parent: 'aws-intro',
        desc: 'Identity and Access Management. Securely control access to AWS resources.',
        content: `
# IAM (Identity and Access Management)

AWS IAM enables you to securely control access to AWS services and resources for your users.

*   **Root Account**: The email address used to create the AWS account. Has full access. *Secure this immediately with MFA.*
*   **MFA (Multi-Factor Authentication)**: Adding an extra layer of protection on top of your user name and password.
        `,
        pos: { x: 0, y: 300 }
    },
    {
        id: 'iam-users',
        title: 'Users & Groups',
        type: 'branch',
        parent: 'iam',
        desc: 'Managing individual people and teams.',
        content: `
# IAM Users & Groups

*   **IAM User**: An entity that you create in AWS to represent the person or application that uses it to interact with AWS.
*   **IAM Group**: A collection of IAM users. You can use groups to specify permissions for a collection of users, which can make those permissions easier to manage for those users.
        `,
        pos: { x: 300, y: 300 }
    },
    {
        id: 'iam-policies',
        title: 'IAM Policies',
        type: 'branch',
        parent: 'iam',
        desc: 'JSON documents that define permissions.',
        content: `
# IAM Policies

A policy is an object in AWS that, when associated with an identity or resource, defines their permissions.

*   **Structure**: Version, Statement (Sid, Effect, Principal, Action, Resource).
*   **Principle of Least Privilege**: Granting only the permissions required to perform a task.
        `,
        pos: { x: 300, y: 380 }
    },
    {
        id: 'iam-roles',
        title: 'IAM Roles',
        type: 'branch',
        parent: 'iam',
        desc: 'Temporary credentials for trusted entities.',
        content: `
# IAM Roles

An IAM role is an IAM identity that you can create in your account that has specific permissions.

*   **Use Cases**:
    *   **EC2 Instance Roles**: Giving an EC2 instance permission to access S3 buckets without storing hardcoded API keys.
    *   **Cross-Account Access**: allowing a user from Account A to access resources in Account B.
        `,
        pos: { x: 300, y: 460 }
    },

    // --- 3. EC2 ---
    {
        id: 'ec2',
        title: 'EC2 (Compute)',
        type: 'main',
        parent: 'iam',
        desc: 'Elastic Compute Cloud. Virtual servers in the cloud.',
        content: `
# Amazon EC2

Amazon Elastic Compute Cloud (Amazon EC2) provides scalable computing capacity in the Amazon Web Services (AWS) Cloud.

*   **Instances**: Virtual computing environments.
*   **AMI (Amazon Machine Image)**: Template for your instance (OS + App Server + Applications).
*   **Instance Types**:
    *   **General Purpose (T2/T3, M5)**: Balanced resources.
    *   **Compute Optimized (C5)**: High performance processors.
    *   **Memory Optimized (R5)**: High RAM workloads (DBs).
        `,
        pos: { x: 0, y: 600 }
    },
    {
        id: 'ec2-storage',
        title: 'EBS & Instance Store',
        type: 'branch',
        parent: 'ec2',
        desc: 'Block storage for EC2 instances.',
        content: `
# EC2 Storage

*   **EBS (Elastic Block Store)**:
    *   Network drive attached to your instance.
    *   Persistent data (can persist after termination if configured).
    *   Snapshots for backups.
*   **Instance Store (Ephemeral Storage)**:
    *   Physically attached to the host.
    *   *Ephemeral*: Data is LOST if the instance stops or terminates.
    *   Very high I/O performance.
        `,
        pos: { x: -300, y: 600 }
    },
    {
        id: 'ec2-network',
        title: 'Elastic IP & Security',
        type: 'branch',
        parent: 'ec2',
        desc: 'Networking basics for instances.',
        content: `
# Networking for EC2

*   **Security Groups**: Virtual firewalls controlling traffic for one or more instances. (Stateful).
*   **Elastic IP**: A static IPv4 address designed for dynamic cloud computing. You own it until you release it.
*   **Key Pairs**: Secure login information for your instances. Linux instances have no password; you use a private key file (.pem) to SSH in.
        `,
        pos: { x: -300, y: 680 }
    },
    {
        id: 'ec2-purchase',
        title: 'Purchasing Options',
        type: 'branch',
        parent: 'ec2',
        desc: 'On-Demand, Spot, Reserved, Savings Plans.',
        content: `
# EC2 Pricing Models

*   **On-Demand**: Pay for what you use by the second. No commitment.
*   **Reserved Instances (RI)**: Commit to 1 or 3 years. Significant discount (up to 72%).
*   **Spot Instances**: Bid on unused capacity. Up to 90% discount. Can be terminated with 2 min notice.
*   **Savings Plans**: Commit to a specific amount of usage (e.g. $10/hr) for 1 or 3 years.
        `,
        pos: { x: -300, y: 760 }
    },

    // --- 4. VPC ---
    {
        id: 'vpc',
        title: 'VPC (Networking)',
        type: 'main',
        parent: 'ec2',
        desc: 'Virtual Private Cloud. Isolated cloud network.',
        content: `
# Amazon VPC

Amazon Virtual Private Cloud (Amazon VPC) enables you to launch AWS resources into a virtual network that you've defined.

*   **CIDR Block**: Classless Inter-Domain Routing. Defines the IP range of your VPC (e.g., 10.0.0.0/16).
*   **Tenancy**: Default (shared hardware) vs Dedicated (dedicated hardware).
        `,
        pos: { x: 0, y: 900 }
    },
    {
        id: 'subnets',
        title: 'Subnets & Gateways',
        type: 'branch',
        parent: 'vpc',
        desc: 'Public vs Private subnets, IGW, NAT.',
        content: `
# Subnets & Gateways

*   **Subnet**: A range of IP addresses in your VPC. Matches to one Availability Zone.
    *   **Public Subnet**: Has a Route Table entry to an Internet Gateway (IGW).
    *   **Private Subnet**: No direct route to the Internet.
*   **Internet Gateway (IGW)**: Horizontally scaled, redundant, and highly available VPC component that allows communication between your VPC and the internet.
*   **NAT Gateway**: Allows instances in a private subnet to connect to the internet (for updates) but prevents the internet from initiating a connection to those instances.
        `,
        pos: { x: 300, y: 900 }
    },
    {
        id: 'security-groups',
        title: 'Security Groups vs NACLs',
        type: 'branch',
        parent: 'vpc',
        desc: 'Instance level vs Subnet level security.',
        content: `
# Firewalls in AWS

*   **Security Groups**:
    *   Operates at the **Instance** level.
    *   **Stateful**: Return traffic is automatically allowed.
    *   deny rules are NOT allowed (Allow only).
*   **NACL (Network Access Control List)**:
    *   Operates at the **Subnet** level.
    *   **Stateless**: Return traffic must be explicitly allowed.
    *   Supports ALLOW and DENY rules.
        `,
        pos: { x: 300, y: 980 }
    },

    // --- 5. Storage (S3) ---
    {
        id: 's3',
        title: 'S3 (Storage)',
        type: 'main',
        parent: 'vpc',
        desc: 'Simple Storage Service. Object storage built to retrieve any amount of data from anywhere.',
        content: `
# Amazon S3

*   **Object Storage**: Stores data as objects (files), not blocks.
*   **Buckets**: Foundational container for data storage. Names must be globally unique.
*   **Durability**: 99.999999999% (11 9s).
*   **Availability**: 99.99%.
        `,
        pos: { x: 0, y: 1200 }
    },
    {
        id: 's3-classes',
        title: 'Storage Classes',
        type: 'branch',
        parent: 's3',
        desc: 'Standard, Infrequent Access, Glacier.',
        content: `
# S3 Storage Classes

*   **S3 Standard**: General purpose, frequently accessed data.
*   **S3 Standard-IA (Infrequent)**: Long-lived, but less frequently accessed data. Cheaper storage, retrieval fee.
*   **S3 One Zone-IA**: Same as IA but stored in only one AZ (lower cost, lower availability).
*   **S3 Glacier**: Low-cost data archiving. Retrieval times range from minutes to hours.
*   **S3 Glacier Deep Archive**: Lowest cost. Retrieval time of 12 hours.
        `,
        pos: { x: -300, y: 1200 }
    },
    {
        id: 's3-features',
        title: 'Lifecycle & Security',
        type: 'branch',
        parent: 's3',
        desc: 'Versioning, Encryption, Lifecycle Policies.',
        content: `
# S3 Advanced Features

*   **Versioning**: Keep multiple variants of an object in the same bucket. Protects against accidental deletion.
*   **Encryption**:
    *   **SSE-S3**: Keys managed by S3.
    *   **SSE-KMS**: Keys managed by KMS (more control).
    *   **SSE-C**: Customer provided keys.
*   **Lifecycle Rules**: Automate moving objects between storage classes (e.g., move to Glacier after 30 days).
        `,
        pos: { x: -300, y: 1280 }
    },

    // --- 6. Route 53 ---
    {
        id: 'route53',
        title: 'Route 53 (DNS)',
        type: 'main',
        parent: 's3',
        desc: 'Scalable Domain Name System (DNS) web service.',
        content: `
# Amazon Route 53

*   **DNS (Domain Name System)**: Phonebook of the internet (translates google.com to 172.217.16.206).
*   **Hosted Zones**: Container for records.
*   **Records**: A, AAAA, CNAME, ALIAS, MX, NS, SOA.
*   **Health Checks**: Route 53 monitors the health and performance of your application.
        `,
        pos: { x: 0, y: 1500 }
    },
    {
        id: 'routing',
        title: 'Routing Policies',
        type: 'branch',
        parent: 'route53',
        desc: 'Simple, Weighted, Latency, Failover.',
        content: `
# Routing Policies

*   **Simple**: Standard DNS.
*   **Weighted**: Split traffic (e.g., 20% to A, 80% to B). Good for A/B testing.
*   **Latency**: Route to the region with the lowest latency for the user.
*   **Failover**: Primary vs Secondary (Disaster Recovery).
*   **Geolocation**: Route based on user location (e.g. France users to Paris region).
        `,
        pos: { x: 300, y: 1500 }
    },

    // --- 7. Databases ---
    {
        id: 'db-layer',
        title: 'Databases',
        type: 'main',
        parent: 'route53',
        desc: 'Manage Relational and NoSQL data.',
        content: `
# AWS Database Services

Choose the right database for the job.
*   **Relational (SQL)**: RDS, Aurora.
*   **NoSQL**: DynamoDB.
*   **In-Memory**: ElastiCache.
*   **Warehousing**: Redshift.
        `,
        pos: { x: 0, y: 1800 }
    },
    {
        id: 'rds',
        title: 'RDS (SQL)',
        type: 'branch',
        parent: 'db-layer',
        desc: 'Managed Relational Database Service.',
        content: `
# Amazon RDS

*   **Engines**: MySQL, PostgreSQL, MariaDB, Oracle, SQL Server, Aurora.
*   **Managed Service**: AWS handles patching, backups, failure detection, and recovery.
*   **Multi-AZ**: Synchronous replication to another AZ for High Availability (Disaster Recovery).
*   **Read Replicas**: Asynchronous replication for scaling READ performance.
        `,
        pos: { x: -300, y: 1800 }
    },
    {
        id: 'dynamodb',
        title: 'DynamoDB (NoSQL)',
        type: 'branch',
        parent: 'db-layer',
        desc: 'Key-value and document database that delivers single-digit millisecond performance at any scale.',
        content: `
# Amazon DynamoDB

*   **NoSQL**: Schema-less.
*   **Fully Managed**: Serverless (no instances to provision).
*   **Performance**: Single-digit millisecond latency.
*   **Structure**: Tables -> Items (Rows) -> Attributes (Columns).
*   **Key Design**:
    *   **Partition Key (Hash)**.
    *   **Sort Key (Range)**.
*   **Capacity Modes**: Provisioned (Predictable traffic) vs On-Demand (Unpredictable).
        `,
        pos: { x: 300, y: 1800 }
    },

    // --- 8. Scaling & Monitoring ---
    {
        id: 'scaling',
        title: 'Scaling & ELB',
        type: 'main',
        parent: 'db-layer',
        desc: 'Elastic Load Balancing and Auto Scaling.',
        content: `
# High Availability & Scalability

*   **Vertical Scaling**: Increasing instance size (t2.micro -> t2.large). "Scaling Up".
*   **Horizontal Scaling**: Increasing number of instances. "Scaling Out". Cloud native approach.
*   **ELB (Elastic Load Balancer)**: Distributes incoming application traffic across multiple targets.
    *   **ALB (Application)**: Layer 7 (HTTP/HTTPS). Path based routing.
    *   **NLB (Network)**: Layer 4 (TCP/UDP, TLS). Ultra high performance.
        `,
        pos: { x: 0, y: 2100 }
    },
    {
        id: 'asg',
        title: 'Auto Scaling Groups',
        type: 'branch',
        parent: 'scaling',
        desc: 'Scale your EC2 capacity automatically.',
        content: `
# Auto Scaling Groups (ASG)

*   **Goal**: Ensure you have the correct number of EC2 instances available to handle load.
*   **Parameters**: Min size, Max size, Desired capacity.
*   **Scaling Policies**:
    *   **Target Tracking**: "Video CPU at 50%".
    *   **Simple/Step**: "Add 2 units when alarm breaches".
    *   **Scheduled**: "Scale up at 9am on Monday".
        `,
        pos: { x: -300, y: 2100 }
    },
    {
        id: 'cloudwatch',
        title: 'CloudWatch',
        type: 'branch',
        parent: 'scaling',
        desc: 'Monitoring and Observability service.',
        content: `
# Amazon CloudWatch

*   **Metrics**: Data points over time (CPU Utilization, NetworkIn).
*   **Alarms**: Watch metrics and trigger actions (e.g., Scale ASG, Send SNS).
*   **Logs**: Monitor, store, and access log files from EC2, Route53, Lambda, etc.
*   **Events (EventBridge)**: React to changes in your AWS environment (e.g., Instance State Change).
        `,
        pos: { x: 300, y: 2100 }
    }
];

// --- Seeding Function ---
async function seedAWS() {
    try {
        console.log('🌱 Starting AWS Roadmap Seeding Protocol...');

        // 1. Find existing AWS Skill or create new
        let awsSkill = await Skill.findOne({ name: 'AWS Cloud Architect' });

        if (!awsSkill) {
            console.log('Creating new AWS Skill...');
            awsSkill = new Skill({
                name: 'AWS Cloud Architect',
                category: 'Cloud Computing',
                description: 'Master the Amazon Web Services ecosystem. From core infrastructure to advanced serverless architectures.',
                icon: 'fa-cloud',
                color: '#FF9900',
                level: 3,
                xpRequired: 1500,
                estimatedHours: 60,
                prerequisites: [],
                position: { x: 600, y: 300 }
            });
        }

        // 2. Map structure to Topic Objects
        // We need to resolve parent references after creating IDs
        const topicMap = {};

        // Create Topic Objects
        const topics = awsStructure.map(node => {
            const topic = {
                _id: getObjectId(node.id), // Deterministic ID
                title: node.title,
                type: node.type,
                description: node.desc,
                content: node.content,
                xp: node.type === 'main' ? 100 : 50,
                position: node.pos,
                lectures: [],
                resources: []
            };
            topicMap[node.id] = topic._id;
            return topic;
        });

        // Resolve Parents
        topics.forEach((topic, index) => {
            const node = awsStructure[index];
            if (node.parent) {
                topic.parent = topicMap[node.parent];
            }
        });

        // 3. Update Skill
        awsSkill.topics = topics;

        await awsSkill.save();

        console.log('✅ AWS Roadmap Seeded Successfully!');
        console.log(`Updated ${topics.length} topics in the AWS Protocol.`);
        process.exit(0);

    } catch (e) {
        console.error('❌ Seeding Failed:', e);
        process.exit(1);
    }
}

// Connect and Run
const connectDB = require('./config/db');
const dotenv = require('dotenv');
dotenv.config();

connectDB().then(seedAWS);
