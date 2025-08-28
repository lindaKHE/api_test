export function getImplicitProfile(birthdate?: Date | null) {
    if (!birthdate) return null;
  
    const age = new Date().getFullYear() - birthdate.getFullYear();
  
    if (age < 10) return { code: "enfant", label: "Enfant" };
    if (age < 25) return { code: "jeune", label: "Jeune" };
    if (age < 50) return { code: "tout_public", label: "Tout public" };
    return { code: "senior", label: "Senior" };
  }
  