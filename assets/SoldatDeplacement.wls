// Attacher au personnage 3D. Ne pas cumuler avec son contrôleur de déplacement.
public float vitesse = 3.5;
public float sprint = 6;
public float pas = 0;

Update(){
    pas = vitesse * Time.deltaTime;
    if(Input.GetKey("shift")){ pas = sprint * Time.deltaTime; }
    if(Input.GetKey("z")){ Move(0, 0, -pas); }
    if(Input.GetKey("s")){ Move(0, 0, pas); }
    if(Input.GetKey("q")){ Move(-pas, 0, 0); }
    if(Input.GetKey("d")){ Move(pas, 0, 0); }
}
