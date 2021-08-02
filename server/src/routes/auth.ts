import { Response, Router } from "express";
const router = Router();

router.get("/", (_, res: Response) => {
	res.send("Hi");
});

export default router;
