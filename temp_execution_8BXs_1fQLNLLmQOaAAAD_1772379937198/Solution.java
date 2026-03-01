import java.util.*;

public class Solution {
    public static void main(String[] args) {
        int[] arr = new int[34];
        Scanner sc = new Scanner(System.in);

        for(int i = 0; i < 34; i++) {
            arr[i] = sc.nextInt();
        }

        int left = 0;
        int right = 33;
        int target = 34;

        while(left < right) {
            int sum = arr[left] + arr[right];

            if(sum == target) {
                System.out.println(1);
                return;
            }
            else if(sum < target) {
                left++;
            }
            else {
                right--;
            }
        }

        System.out.println(0);
    }
}