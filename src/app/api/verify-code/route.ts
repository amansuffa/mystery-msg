import dbConnect from "@/lib/dbConnect";
import UserModel from "@/models/User";

export async function POST(request: Request) {
    await dbConnect();

    try {
        const { username, code } = await request.json()

        //just for safety - return a normal url of the given encoded URI component
        const decodeUsername = decodeURIComponent(username)
        
        const user = await UserModel.findOne({ username: decodeUsername });
        if (!user) {
            return Response.json(
                {
                    success: false,
                    message: 'User not found',
                },
                { status: 500 }
            );
        }

        const isCodeValid = user.verifyCode === code
        const isCodeNotExpired = user.verifyCodeExpiry > new Date()

        if (isCodeValid && isCodeNotExpired) {
            user.isVerified = true;
            await user.save();
            return Response.json(
                {
                    success: true,
                    message: 'Account verified successfully',
                },
                { status: 200 }
            );
        } else if (!isCodeNotExpired) {
            return Response.json(
                {
                    success: false,
                    message: 'Verification Code has been expired, Please sign-up again to get a new code',
                },
                { status: 400 }
            );
        } else {
            return Response.json(
                {
                    success: false,
                    message: 'Incorrect Verification code',
                },
                { status: 400 }
            );
        }

    } catch (error) {
        console.error('Error verifying user', error);
        return Response.json(
            {
                success: false,
                message: 'Error verifying user',
            },
            { status: 500 }
        );
    }
}