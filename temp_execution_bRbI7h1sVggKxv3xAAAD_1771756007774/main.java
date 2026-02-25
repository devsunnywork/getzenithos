import java.util.Scanner;
 class main {
    public static void main(String[] args) {
        // Create a Scanner object to read input from the terminal
        Scanner sc = new Scanner(System.in);
        
        System.out.println("Enter first number:");
        int num1 = sc.nextInt();
        
        System.out.println("Enter second number:");
        int num2 = sc.nextInt();
    
        
        // Calculate the sumsds
        int sum = num1 + num2;
        
        System.out.println("The sum is: " + sum);
    
        
        // Close the scanner to prevent memory leaks
        sc.close();
    }
}
