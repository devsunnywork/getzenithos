import java.util.Scanner;

class BankAccount {
    int accNo;
    String name;
    double balance;

    BankAccount(int accNo, String name, double balance) {
        this.accNo = accNo;
        this.name = name;
        this.balance = balance;
    }

    void deposit(double amount) {
        balance += amount;
        System.out.println("Amount Deposited.");
    }

    void withdraw(double amount) {
        if (amount > balance) {
            System.out.println("Insufficient Balance.");
        } else {
            balance -= amount;
            System.out.println("Amount Withdrawn.");
        }
    }

    void display() {
        System.out.println(accNo + "  " + name + "  Balance: " + balance);
    }
}

public class BankSystem {

    public static void main(String[] args) {

        Scanner sc = new Scanner(System.in);
        BankAccount[] accounts = new BankAccount[5];

        int count = 0;
        int choice;

        while (true) {
            System.out.println("\n1.Create Account");
            System.out.println("2.Deposit");
            System.out.println("3.Withdraw");
            System.out.println("4.Display All");
            System.out.println("5.Exit");
            System.out.print("Enter choice: ");

            choice = sc.nextInt();

            switch (choice) {

                case 1:
                    if (count < 5) {
                        System.out.print("Enter AccNo Name Balance: ");
                        int accNo = sc.nextInt();
                        String name = sc.next();
                        double bal = sc.nextDouble();

                        accounts[count] = new BankAccount(accNo, name, bal);
                        count++;
                        System.out.println("Account Created.");
                    } else {
                        System.out.println("Bank Full.");
                    }
                    break;

                case 2:
                    System.out.print("Enter AccNo: ");
                    int depNo = sc.nextInt();
                    for (int i = 0; i < count; i++) {
                        if (accounts[i].accNo == depNo) {
                            System.out.print("Enter Amount: ");
                            double amt = sc.nextDouble();
                            accounts[i].deposit(amt);
                        }
                    }
                    break;

                case 3:
                    System.out.print("Enter AccNo: ");
                    int witNo = sc.nextInt();
                    for (int i = 0; i < count; i++) {
                        if (accounts[i].accNo == witNo) {
                            System.out.print("Enter Amount: ");
                            double amt = sc.nextDouble();
                            accounts[i].withdraw(amt);
                        }
                    }
                    break;

                case 4:
                    for (int i = 0; i < count; i++) {
                        accounts[i].display();
                    }
                    break;

                case 5:
                    System.exit(0);
            }
        }
    }
}