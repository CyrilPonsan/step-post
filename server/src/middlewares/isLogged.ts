import { Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

import CustomRequest from "../utils/interfaces/express/custom-request";
import { noAccess } from "../lib/error-messages";

function isLogged(req: CustomRequest, res: Response, next: NextFunction) {
  // on récupère le cookie contenant le jeton d'accès
  const authCookie = req.cookies.accessToken;

  //console.log("middle", req.cookies);

  // en l'absence du dit jeton on renvoie une erreur 403
  if (!authCookie) {
    return res.status(403).json({ message: noAccess });
  }

  // on vérifie que le jeton n'a pas expiré et s'il est bien valide on en extrait les données qu'il contient
  jwt.verify(authCookie, process.env.SESSION_SECRET!, (err: any, data: any) => {
    //console.log({ data, err });

    // s'il n'est pas valide on retourne une erreur 403
    if (err) {
      console.log("oops ça a foiré");

      return res.status(403).json({ message: noAccess });
    } else if (
      data &&
      data.userRoles[0] === "expediteur" &&
      !data.userRoles.includes["inactif"]
    ) {
      // extraction des données utiles pour assurer la bonne continuité de la requête
      req.auth = { userId: data.userId, userRole: data.userRole };
      next();
    } else {
      // si l'utilisateur n'a pas le rôle requis sur cette partie de l'api il reçoit une erreur 403
      return res.status(403).json({ message: "Access denied" });
    }
  });
}

export default isLogged;
