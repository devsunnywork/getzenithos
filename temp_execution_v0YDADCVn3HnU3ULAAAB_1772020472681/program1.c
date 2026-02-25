#include <stdio.h>
#include <stdlib.h>
#include <string.h>

struct Account {
    int accNumber;
    char name[50];
    float balance;
};

int main() {
    struct Account user;
    int choice;
    float amount;

    printf("Enter Account Number: ");
    scanf("%d", &user.accNumber);

    printf("Enter Name: ");
    scanf(" %[^\n]", user.name);

    user.balance = 0;

    while (1) {
        printf("\n--- BANK MENU ---\n");
        printf("1. Deposit\n");
        printf("2. Withdraw\n");
        printf("3. Check Balance\n");
        printf("4. Exit\n");
        printf("Enter choice: ");
        scanf("%d", &choice);

        switch (choice) {
            case 1:
                printf("Enter amount to deposit: ");
                scanf("%f", &amount);
                user.balance += amount;
                printf("Amount Deposited Successfully!\n");
                break;

            case 2:
                printf("Enter amount to withdraw: ");
                scanf("%f", &amount);
                if (amount > user.balance) {
                    printf("Insufficient Balance!\n");
                } else {
                    user.balance -= amount;
                    printf("Amount Withdrawn Successfully!\n");
                }
                break;

            case 3:
                printf("Current Balance: %.2f\n", user.balance);
                break;

            case 4:
                printf("Thank You!\n");
                exit(0);

            default:
                printf("Invalid Choice!\n");
        }
    }

    return 0;
}